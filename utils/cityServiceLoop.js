// ============================================================================
// DimePrecio.es — Motor de Programación en Bucle: Recorrido Ciudades × Servicios
// Recorre todas las ciudades (provincias) y en cada servicio busca noticias
// recientes o curiosidades locales y genera un artículo optimizado con IA.
// Soporta pausa, reanudación, salto, reintentos, salto a ciudad y bucle infinito.
// ============================================================================
const pool = require('../db');
const rr = require('./rankRentEngine');
const ai = require('./ai');
const news = require('./news');
const trendsEngine = require('./trendsEngine');
const imageManager = require('./imageManager');
const semanticMatcher = require('./semanticMatcher');

const DEFAULT_CONFIG = {
  status: 'idle',               // 'idle' | 'running' | 'paused' | 'completed'
  cycle_number: 1,
  current_index: 0,
  order_mode: 'city_first',     // 'city_first' | 'service_first'
  content_mode: 'recomendados_ia', // 'recomendados_ia' | 'mixto' | 'noticias' | 'tendencias' | 'curiosidades'
  interval_seconds: 300,        // 5 minutos por defecto (mín 15s, máx 86400s)
  auto_publish: 1,              // 1 = published, 0 = draft
  loop_forever: 1,              // 1 = al acabar todas las ciudades×servicios empieza nueva vuelta
  use_fallback: 1,              // 1 = si falla la IA externa usa generador local artesanal
  selected_provinces: null,     // null = todas las 52 ciudades
  selected_sectors: null,       // null = todos los 30 servicios
  current_provincia_slug: null,
  current_sector_slug: null,
  current_step_message: 'En espera',
  total_generated: 0,
  total_failed: 0,
  last_run_at: null,
  next_run_at: null,
};

const CURIOSITY_ANGLES = [
  {
    key: 'curiosidades_locales',
    label: 'Curiosidades y datos sorprendentes',
    buildPrompt: (sec, loc, muni) =>
      `Curiosidades poco conocidas, datos sorprendentes y particularidades reales sobre ${sec.nombre} en ${loc.nombre} (especialmente en zonas como ${muni}): historia del oficio en la provincia, peculiaridades de sus viviendas/edificios, cifras curiosas de demanda y guía actualizada de precios.`,
  },
  {
    key: 'normativa_ayudas',
    label: 'Normativa municipal, permisos y ayudas locales',
    buildPrompt: (sec, loc, muni) =>
      `Novedades, normativa municipal, licencias y curiosidades legales al contratar ${sec.nombre} en ${loc.nombre} y ${muni}: qué permisos exigen los ayuntamientos de la zona, multas curiosas por desconocimiento, subvenciones vigentes y tarifas medias actuales.`,
  },
  {
    key: 'clima_arquitectura',
    label: 'Impacto del clima y la arquitectura local',
    buildPrompt: (sec, loc, muni) =>
      `Cómo el clima, el tipo de construcción y las características urbanas de ${loc.nombre} (${muni}) afectan a los trabajos de ${sec.nombre}: averías o necesidades más curiosas de la zona, consejos técnicos de especialistas locales y tabla de precios orientativos.`,
  },
  {
    key: 'mitos_errores',
    label: 'Mitos, trucos y errores curiosos de los vecinos',
    buildPrompt: (sec, loc, muni) =>
      `Mitos populares, curiosidades del sector y errores más costosos que cometen los vecinos de ${loc.nombre} (${muni}) al pedir presupuesto de ${sec.nombre}: casos reales, cómo ahorrar sin perder calidad y baremos de precios auditados.`,
  },
  {
    key: 'tendencias_innovacion',
    label: 'Tendencias, innovación y demanda actual',
    buildPrompt: (sec, loc, muni) =>
      `Tendencias actuales, tecnologías nuevas y curiosidades sobre cómo está cambiando el sector de ${sec.nombre} en ${loc.nombre} y ${muni}: servicios más solicitados este año, comparativa de soluciones modernas y precios medios.`,
  },
];

let tablesReady = false;
let isStepRunning = false;
let activeTimer = null;
let liveStepMessage = '';
let liveCurrentItemId = null;

function parseJsonArray(val) {
  if (!val) return null;
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) && parsed.length ? parsed.filter(Boolean) : null;
    } catch {
      return null;
    }
  }
  return null;
}

async function ensureTables() {
  if (tablesReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS city_service_loop_config (
      id TINYINT PRIMARY KEY,
      status VARCHAR(20) NOT NULL DEFAULT 'idle',
      cycle_number INT NOT NULL DEFAULT 1,
      current_index INT NOT NULL DEFAULT 0,
      order_mode VARCHAR(20) NOT NULL DEFAULT 'city_first',
      content_mode VARCHAR(20) NOT NULL DEFAULT 'mixto',
      interval_seconds INT NOT NULL DEFAULT 300,
      auto_publish TINYINT(1) NOT NULL DEFAULT 1,
      loop_forever TINYINT(1) NOT NULL DEFAULT 1,
      use_fallback TINYINT(1) NOT NULL DEFAULT 1,
      selected_provinces JSON NULL,
      selected_sectors JSON NULL,
      current_provincia_slug VARCHAR(80) NULL,
      current_sector_slug VARCHAR(100) NULL,
      current_step_message VARCHAR(255) NULL,
      total_generated INT NOT NULL DEFAULT 0,
      total_failed INT NOT NULL DEFAULT 0,
      last_run_at DATETIME NULL,
      next_run_at DATETIME NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS city_service_loop_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cycle_number INT NOT NULL DEFAULT 1,
      step_index INT NOT NULL,
      provincia_slug VARCHAR(80) NOT NULL,
      provincia_nombre VARCHAR(120) NOT NULL,
      sector_slug VARCHAR(100) NOT NULL,
      sector_nombre VARCHAR(190) NOT NULL,
      status ENUM('pending', 'processing', 'completed', 'failed', 'skipped') NOT NULL DEFAULT 'pending',
      source_type VARCHAR(32) NULL,
      source_title VARCHAR(500) NULL,
      source_url VARCHAR(500) NULL,
      post_id INT NULL,
      post_slug VARCHAR(255) NULL,
      post_title VARCHAR(255) NULL,
      error_message TEXT NULL,
      started_at DATETIME NULL,
      finished_at DATETIME NULL,
      UNIQUE KEY uniq_cycle_step (cycle_number, step_index),
      INDEX idx_cycle_status (cycle_number, status),
      INDEX idx_prov_sec (provincia_slug, sector_slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(
    `INSERT IGNORE INTO city_service_loop_config (
      id, status, cycle_number, current_index, order_mode, content_mode,
      interval_seconds, auto_publish, loop_forever, use_fallback, current_step_message
    ) VALUES (1, 'idle', 1, 0, 'city_first', 'recomendados_ia', 300, 1, 1, 1, 'Listo para iniciar')`
  );

  tablesReady = true;
}

async function getConfig() {
  await ensureTables();
  const [rows] = await pool.query('SELECT * FROM city_service_loop_config WHERE id = 1 LIMIT 1');
  if (!rows || !rows.length) {
    return { ...DEFAULT_CONFIG };
  }
  const row = rows[0];
  return {
    ...DEFAULT_CONFIG,
    ...row,
    selected_provinces: parseJsonArray(row.selected_provinces),
    selected_sectors: parseJsonArray(row.selected_sectors),
    auto_publish: Number(row.auto_publish) ? 1 : 0,
    loop_forever: Number(row.loop_forever) ? 1 : 0,
    use_fallback: Number(row.use_fallback) ? 1 : 0,
    interval_seconds: Math.max(15, Math.min(86400, Number(row.interval_seconds) || 300)),
    cycle_number: Math.max(1, Number(row.cycle_number) || 1),
    current_index: Math.max(0, Number(row.current_index) || 0),
    total_generated: Number(row.total_generated) || 0,
    total_failed: Number(row.total_failed) || 0,
  };
}

/**
 * Construye la matriz ordenada de combinaciones (Ciudad × Servicio).
 */
function buildMatrix(cfg) {
  let locations = rr.getLocations(false) || [];
  let sectors = rr.getSectors(false) || [];

  const provFilter = parseJsonArray(cfg.selected_provinces);
  const secFilter = parseJsonArray(cfg.selected_sectors);

  if (provFilter && provFilter.length) {
    const set = new Set(provFilter);
    const filtered = locations.filter(l => set.has(l.slug));
    if (filtered.length) locations = filtered;
  }

  if (secFilter && secFilter.length) {
    const set = new Set(secFilter);
    const filtered = sectors.filter(s => set.has(s.slug));
    if (filtered.length) sectors = filtered;
  }

  const pairs = [];
  if (cfg.order_mode === 'service_first') {
    for (const sec of sectors) {
      for (const loc of locations) {
        pairs.push({
          provincia_slug: loc.slug,
          provincia_nombre: loc.nombre,
          sector_slug: sec.slug,
          sector_nombre: sec.nombre,
        });
      }
    }
  } else {
    for (const loc of locations) {
      for (const sec of sectors) {
        pairs.push({
          provincia_slug: loc.slug,
          provincia_nombre: loc.nombre,
          sector_slug: sec.slug,
          sector_nombre: sec.nombre,
        });
      }
    }
  }

  // Modo aleatorio (recomendado para SEO: mezcla provincias y servicios sin repetir ciudad consecutiva)
  if (cfg.order_mode === 'random') {
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
  }

  return pairs.map((p, idx) => ({ step_index: idx, ...p }));
}

/**
 * Garantiza que existan las filas del ciclo actual en city_service_loop_items.
 */
async function ensureCycleItems(cfg) {
  await ensureTables();
  const cycle = cfg.cycle_number || 1;
  const [[countRow]] = await pool.query(
    'SELECT COUNT(*) AS cnt FROM city_service_loop_items WHERE cycle_number = ?',
    [cycle]
  );
  if (Number(countRow?.cnt || 0) > 0) {
    return Number(countRow.cnt);
  }

  const matrix = buildMatrix(cfg);
  if (!matrix.length) return 0;

  // Insertar en lotes de 250 para máxima velocidad en MySQL
  const chunkSize = 250;
  for (let i = 0; i < matrix.length; i += chunkSize) {
    const chunk = matrix.slice(i, i + chunkSize);
    const placeholders = chunk.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
    const values = [];
    for (const item of chunk) {
      values.push(
        cycle,
        item.step_index,
        item.provincia_slug,
        item.provincia_nombre,
        item.sector_slug,
        item.sector_nombre,
        'pending'
      );
    }
    await pool.query(
      `INSERT IGNORE INTO city_service_loop_items
       (cycle_number, step_index, provincia_slug, provincia_nombre, sector_slug, sector_nombre, status)
       VALUES ${placeholders}`,
      values
    );
  }
  return matrix.length;
}

function getShortSectorTerm(sector) {
  if (!sector) return 'servicios';
  if (Array.isArray(sector.keywords) && sector.keywords.length && sector.keywords[0]) {
    return String(sector.keywords[0]).trim();
  }
  const clean = String(sector.nombre || sector.slug || 'servicios')
    .split(/[,/()]/)[0]
    .replace(/\s+y\s+.*$/i, '')
    .trim();
  return clean || sector.nombre;
}

async function setLiveMessage(msg, provinciaSlug = null, sectorSlug = null) {
  liveStepMessage = msg;
  try {
    const sets = ['current_step_message = ?'];
    const params = [String(msg || '').slice(0, 250)];
    if (provinciaSlug !== null) {
      sets.push('current_provincia_slug = ?');
      params.push(provinciaSlug);
    }
    if (sectorSlug !== null) {
      sets.push('current_sector_slug = ?');
      params.push(sectorSlug);
    }
    await pool.query(`UPDATE city_service_loop_config SET ${sets.join(', ')} WHERE id = 1`, params);
  } catch (e) {
    // silencioso
  }
}

/**
 * Investiga automáticamente la combinación (Provincia + Servicio) combinando:
 * 1. Noticias recientes de la ciudad y el servicio (Google News)
 * 2. Tendencias reales de búsqueda en Google España para esa ciudad y servicio
 * 3. Consultas pendientes de Google Search Console (si existen)
 * 4. Recomendación editorial generada con IA (preferiblemente en modo recomendados_ia)
 */
async function discoverNewsOrCuriosity(loc, sec, contentMode, cycleNumber, stepIndex) {
  const shortSector = getShortSectorTerm(sec);
  const municipios = Array.isArray(loc.municipios) && loc.municipios.length ? loc.municipios : [loc.nombre];
  const chosenMunicipio = municipios[(cycleNumber + stepIndex) % municipios.length] || loc.nombre;

  // Obtener títulos/URLs ya usados recientemente para no repetir
  let usedTitles = new Set();
  let usedUrls = new Set();
  try {
    const [seenRows] = await pool.query(
      `SELECT source_title, source_url FROM city_service_loop_items
       WHERE source_title IS NOT NULL ORDER BY id DESC LIMIT 400`
    );
    for (const r of seenRows || []) {
      if (r.source_title) usedTitles.add(String(r.source_title).toLowerCase().trim());
      if (r.source_url) usedUrls.add(String(r.source_url).trim());
    }
  } catch {
    // ignorar si falla
  }

  // 1. Buscar Noticias locales (Google News)
  async function fetchNewsItems() {
    const queries = [
      `${shortSector} ${loc.nombre}`,
      `${sec.nombre} ${loc.nombre}`,
      loc.comunidad_autonoma ? `${shortSector} ${loc.comunidad_autonoma}` : null,
    ].filter(Boolean);

    for (const qStr of queries) {
      try {
        const data = await news.searchNews('es', { query: qStr, num: 8 });
        const items = (Array.isArray(data.normalized) ? data.normalized : []).filter(n => {
          if (!n.title || n.title === 'Sin título') return false;
          const tLower = n.title.toLowerCase().trim();
          if (usedTitles.has(tLower)) return false;
          if (n.link && usedUrls.has(n.link.trim())) return false;
          return true;
        });
        if (items.length > 0) return items;
      } catch (err) {
        console.warn(`[CityServiceLoop] Búsqueda de noticias falló para "${qStr}":`, err.message);
      }
    }
    return [];
  }

  // 2. Buscar Tendencias reales de Google Suggest para esa ciudad y servicio
  async function fetchTrendQueries() {
    try {
      const sug = await trendsEngine.getGoogleSuggestions(shortSector, loc.nombre, { deep: false, max: 12 });
      return [
        ...(sug.questions || []),
        ...(sug.priceQueries || []),
        ...(sug.all || []),
      ].filter(s => s && !usedTitles.has(String(s).toLowerCase().trim())).slice(0, 8);
    } catch {
      return [];
    }
  }

  // 3. Buscar consultas reales en Google Search Console (si existen para esta provincia y servicio)
  async function fetchGscQueries() {
    try {
      const [rows] = await pool.query(
        `SELECT query_text FROM gsc_queries
         WHERE used_count = 0 AND query_text LIKE ? AND query_text LIKE ?
         ORDER BY impressions DESC LIMIT 5`,
        [`%${loc.nombre}%`, `%${shortSector}%`]
      );
      return (rows || []).map(r => r.query_text).filter(Boolean);
    } catch {
      return [];
    }
  }

  const mode = contentMode || 'recomendados_ia';
  const needNews = ['recomendados_ia', 'mixto', 'noticias'].includes(mode);
  const needTrends = ['recomendados_ia', 'mixto', 'tendencias', 'curiosidades'].includes(mode);
  const needAiRec = mode === 'recomendados_ia' || mode === 'mixto';

  const [newsItems, trendQueries, gscQueries] = await Promise.all([
    needNews ? fetchNewsItems() : Promise.resolve([]),
    needTrends ? fetchTrendQueries() : Promise.resolve([]),
    needAiRec ? fetchGscQueries() : Promise.resolve([]),
  ]);

  const topNews = newsItems[0] || null;
  const topTrend = trendQueries[0] || '';
  const topGsc = gscQueries[0] || '';
  const angle = CURIOSITY_ANGLES[(cycleNumber + stepIndex) % CURIOSITY_ANGLES.length];

  // 4. Recomendación editorial con IA combinando noticias + tendencias + GSC
  let aiRec = null;
  if (needAiRec && typeof ai.recommendCityServiceAngle === 'function') {
    aiRec = await ai.recommendCityServiceAngle({
      provinciaNombre: loc.nombre,
      municipio: chosenMunicipio,
      sectorNombre: sec.nombre,
      newsItems,
      trendQueries,
      gscQueries,
    });
  }

  // Construir el briefing combinado con TODAS las señales encontradas
  const promptParts = [];
  const summaryParts = [];
  const typeTags = [];

  if (aiRec) {
    typeTags.push('IA');
    if (aiRec.recommended_title) {
      promptParts.push(`Enfoque y titular recomendado por dirección editorial IA: "${aiRec.recommended_title}".`);
      summaryParts.push(`✨ IA: ${aiRec.recommended_title}`);
    }
    if (aiRec.recommended_angle) {
      promptParts.push(`Ángulo editorial principal: ${aiRec.recommended_angle}`);
    }
    if (aiRec.local_curiosity) {
      promptParts.push(`Curiosidad local a destacar sobre ${loc.nombre} (${chosenMunicipio}): ${aiRec.local_curiosity}`);
    }
    if (aiRec.key_points && aiRec.key_points.length) {
      promptParts.push(`Puntos clave obligatorios a desarrollar: ${aiRec.key_points.join('; ')}.`);
    }
  }

  if (topNews) {
    typeTags.push('noticia');
    const sourceLabel = topNews.source ? ` (${topNews.source}${topNews.date ? `, ${topNews.date}` : ''})` : '';
    promptParts.push(
      `Noticia reciente sobre ${sec.nombre} en ${loc.nombre}: "${topNews.title}"${sourceLabel}. ` +
      `Usa esta noticia como contexto de actualidad real explicando cómo impacta en los vecinos y precios de ${loc.nombre} y ${chosenMunicipio}.`
    );
    summaryParts.push(`📰 ${topNews.title}${topNews.source ? ` (${topNews.source})` : ''}`);
  }

  if (topTrend || topGsc) {
    typeTags.push('tendencia');
    const trendsList = [topGsc, ...trendQueries.slice(0, 4)].filter(Boolean);
    promptParts.push(
      `Tendencias reales de búsqueda en Google para ${sec.nombre} en ${loc.nombre}: "${trendsList.join('", "')}". ` +
      `Responde directamente a estas búsquedas y preguntas frecuentes en el artículo.`
    );
    summaryParts.push(`🔥 Tendencia: "${topGsc || topTrend}"`);
  }

  if (!aiRec || mode === 'curiosidades') {
    if (!typeTags.length || mode === 'curiosidades') typeTags.push('curiosidad');
    promptParts.push(angle.buildPrompt(sec, loc, chosenMunicipio));
    if (!summaryParts.length) {
      summaryParts.push(`💡 ${angle.label} (${chosenMunicipio})`);
    }
  }

  promptParts.push(
    `Redacta un artículo completo, útil y optimizado para ser recomendado por Google e IA sobre ${sec.nombre} en ${loc.nombre} (${chosenMunicipio}) para DimePrecio.es, con tablas de precios reales, consejos prácticos locales y preguntas frecuentes.`
  );

  return {
    source_type: typeTags.join('+') || 'recomendado-ia',
    source_title: summaryParts.join(' · ').slice(0, 490),
    source_url: topNews && topNews.link ? String(topNews.link).slice(0, 490) : null,
    municipio: chosenMunicipio,
    prompt: promptParts.join(' '),
    fallbackQuery: (topGsc || topTrend || (topNews ? topNews.title : '') || `${shortSector} en ${loc.nombre}`).slice(0, 140),
  };
}

/**
 * Obtiene el siguiente elemento pendiente del ciclo actual,
 * respetando current_index (para soportar "Ir a ciudad X") y dando la vuelta si quedaron pendientes atrás.
 */
async function pickNextPendingItem(cfg) {
  const cycle = cfg.cycle_number || 1;
  const cursor = cfg.current_index || 0;

  let [rows] = await pool.query(
    `SELECT * FROM city_service_loop_items
     WHERE cycle_number = ? AND status = 'pending' AND step_index >= ?
     ORDER BY step_index ASC LIMIT 1`,
    [cycle, cursor]
  );

  if (!rows || !rows.length) {
    [rows] = await pool.query(
      `SELECT * FROM city_service_loop_items
       WHERE cycle_number = ? AND status = 'pending'
       ORDER BY step_index ASC LIMIT 1`,
      [cycle]
    );
  }

  return rows && rows.length ? rows[0] : null;
}

/**
 * Ejecuta un único paso del recorrido: busca noticia/curiosidad, genera y publica el artículo.
 */
async function runNextStep({ manual = false } = {}) {
  if (isStepRunning) {
    return { skipped: true, reason: 'already_running', message: 'Ya hay un artículo generándose en este momento.' };
  }

  isStepRunning = true;
  let item = null;

  try {
    let cfg = await getConfig();
    await ensureCycleItems(cfg);

    item = await pickNextPendingItem(cfg);

    // Si no quedan pendientes en esta vuelta:
    if (!item) {
      if (cfg.loop_forever) {
        const nextCycle = cfg.cycle_number + 1;
        await pool.query(
          `UPDATE city_service_loop_config
           SET cycle_number = ?, current_index = 0, current_step_message = ?
           WHERE id = 1`,
          [nextCycle, `¡Vuelta #${cfg.cycle_number} completada! Iniciando Vuelta #${nextCycle}...`]
        );
        cfg = await getConfig();
        await ensureCycleItems(cfg);
        item = await pickNextPendingItem(cfg);
      } else {
        await pool.query(
          `UPDATE city_service_loop_config
           SET status = 'completed', next_run_at = NULL, current_step_message = ?
           WHERE id = 1`,
          [`Recorrido completado (Vuelta #${cfg.cycle_number}).`]
        );
        clearTimer();
        return { completed: true, message: `Vuelta #${cfg.cycle_number} completada al 100%.` };
      }
    }

    if (!item) {
      return { completed: true, message: 'No hay combinaciones ciudad×servicio configuradas.' };
    }

    liveCurrentItemId = item.id;
    const loc = rr.getLocationBySlug(item.provincia_slug) || {
      slug: item.provincia_slug,
      nombre: item.provincia_nombre,
      municipios: [item.provincia_nombre],
      comunidad_autonoma: '',
    };
    const sec = rr.getSectorBySlug(item.sector_slug) || {
      slug: item.sector_slug,
      nombre: item.sector_nombre,
      keywords: [item.sector_nombre],
    };

    // Marcar como processing
    await pool.query(
      `UPDATE city_service_loop_items
       SET status = 'processing', started_at = NOW(), error_message = NULL
       WHERE id = ?`,
      [item.id]
    );
    await pool.query(
      `UPDATE city_service_loop_config
       SET current_index = ?, current_provincia_slug = ?, current_sector_slug = ?
       WHERE id = 1`,
      [item.step_index, loc.slug, sec.slug]
    );

    // 1. Buscar noticia o curiosidad
    await setLiveMessage(
      `Buscando ${cfg.content_mode === 'noticias' ? 'noticias' : cfg.content_mode === 'curiosidades' ? 'curiosidades' : 'noticias y curiosidades'} de ${sec.nombre} en ${loc.nombre}...`,
      loc.slug,
      sec.slug
    );
    const discovery = await discoverNewsOrCuriosity(loc, sec, cfg.content_mode, cfg.cycle_number, item.step_index);

    await pool.query(
      `UPDATE city_service_loop_items
       SET source_type = ?, source_title = ?, source_url = ?
       WHERE id = ?`,
      [discovery.source_type, discovery.source_title, discovery.source_url, item.id]
    );

    // 2. Generar artículo con IA
    await setLiveMessage(
      `Redactando artículo con IA: ${sec.nombre} en ${loc.nombre} (${discovery.source_type})...`,
      loc.slug,
      sec.slug
    );

    let generated = null;
    try {
      generated = await ai.generateArticle(discovery.prompt, {
        provinciaSlug: loc.slug,
        sectorSlug: sec.slug,
        category: sec.nombre,
      });
    } catch (aiErr) {
      if (cfg.use_fallback) {
        console.warn(`[CityServiceLoop] IA externa falló (${aiErr.message}), usando generador local de respaldo.`);
        generated = trendsEngine.buildArtisanArticleForTrend({
          trendQuery: discovery.fallbackQuery,
          sectorSlug: sec.slug,
          provinciaSlug: loc.slug,
          sectorNombre: sec.nombre,
          provinciaNombre: loc.nombre,
        });
      } else {
        throw aiErr;
      }
    }

    // 3. Guardar en tabla posts
    await setLiveMessage(`Publicando artículo de ${sec.nombre} en ${loc.nombre}...`, loc.slug, sec.slug);

    const rawTitle = generated.title || semanticMatcher.generateDynamicTitle(discovery.fallbackQuery, loc.nombre);
    const title = String(rawTitle).slice(0, 250);
    const baseSlug = rr.slugify(generated.slug || title || `${sec.slug}-${loc.slug}`);
    const slug = `${baseSlug.slice(0, 95)}-${Date.now().toString(36)}`;
    const excerpt = (generated.excerpt || generated.meta_description || `Actualidad, curiosidades y precios de ${sec.nombre} en ${loc.nombre}.`).slice(0, 500);
    const content = generated.content || `<p>${excerpt}</p>`;
    const featuredImage =
      generated.featured_image ||
      generated.image ||
      trendsEngine.SECTOR_VERIFIED_IMAGES[sec.slug] ||
      imageManager.getRandomFallbackImage(slug);
    const postStatus = cfg.auto_publish ? 'published' : 'draft';
    const keywords = (generated.keywords || (Array.isArray(generated.tags) ? generated.tags.join(', ') : `${sec.nombre}, ${loc.nombre}, precios`)).slice(0, 490);

    const [ins] = await pool.query(
      `INSERT INTO posts (
        title, slug, excerpt, content, featured_image, image_alt,
        category_id, author_id, status, is_featured, is_breaking,
        is_selected, priority_weight, meta_title, meta_description, keywords,
        provincia_slug, provincia_nombre, sector_slug, sector_nombre,
        municipio_tag, published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, 1, 0, 1, 9, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
      [
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        title,
        postStatus,
        (generated.meta_title || title).slice(0, 250),
        (generated.meta_description || excerpt).slice(0, 490),
        keywords,
        loc.slug,
        loc.nombre,
        sec.slug,
        sec.nombre,
        discovery.municipio || loc.nombre,
      ]
    );

    const postId = ins.insertId;

    if (postId) {
      try {
        rr.updatePostAlgorithmSettings(postId, {
          is_pinned: 0,
          is_selected: 1,
          priority_weight: 9,
          provincia_slug: loc.slug,
          sector_slug: sec.slug,
        });
      } catch {
        // silencioso
      }
      await ai.savePostExtras(postId, {
        evergreen: 9,
        depth: 8,
        provincia_slug: loc.slug,
        sector_slug: sec.slug,
        topics: generated.topicsString || `${sec.nombre}:9, ${loc.nombre}:9`,
        tags: keywords,
        content,
      });
    }

    // 4. Marcar paso como completado y avanzar puntero
    await pool.query(
      `UPDATE city_service_loop_items
       SET status = 'completed', post_id = ?, post_slug = ?, post_title = ?, finished_at = NOW(), error_message = NULL
       WHERE id = ?`,
      [postId, slug, title, item.id]
    );

    await pool.query(
      `UPDATE city_service_loop_config
       SET current_index = ?, total_generated = total_generated + 1, last_run_at = NOW(),
           current_step_message = ?
       WHERE id = 1`,
      [item.step_index + 1, `Publicado: "${title.slice(0, 120)}" (${loc.nombre} · ${sec.nombre})`]
    );

    console.log(`[CityServiceLoop] ✔ Vuelta #${cfg.cycle_number} Paso #${item.step_index + 1}: "${title}" (${loc.nombre} / ${sec.nombre})`);

    return {
      ok: true,
      itemId: item.id,
      postId,
      title,
      slug,
      url: `/article/${slug}`,
      provincia: loc.nombre,
      sector: sec.nombre,
      sourceType: discovery.source_type,
      sourceTitle: discovery.source_title,
      manual,
    };
  } catch (err) {
    console.error('[CityServiceLoop Error]', err.message);
    if (item && item.id) {
      await pool.query(
        `UPDATE city_service_loop_items
         SET status = 'failed', error_message = ?, finished_at = NOW()
         WHERE id = ?`,
        [String(err.message || 'Error desconocido').slice(0, 1000), item.id]
      ).catch(() => {});
      await pool.query(
        `UPDATE city_service_loop_config
         SET current_index = ?, total_failed = total_failed + 1, last_run_at = NOW(),
             current_step_message = ?
         WHERE id = 1`,
        [item.step_index + 1, `Error en ${item.provincia_nombre} / ${item.sector_nombre}: ${String(err.message).slice(0, 140)}`]
      ).catch(() => {});
    }
    throw err;
  } finally {
    isStepRunning = false;
    liveCurrentItemId = null;
    liveStepMessage = '';
    // Reprogramar el siguiente tick si sigue en estado 'running'
    const latestCfg = await getConfig().catch(() => null);
    if (latestCfg && latestCfg.status === 'running') {
      scheduleNextTick(latestCfg.interval_seconds);
    }
  }
}

function clearTimer() {
  if (activeTimer) {
    clearTimeout(activeTimer);
    activeTimer = null;
  }
}

function scheduleNextTick(intervalSeconds) {
  clearTimer();
  const ms = Math.max(15, Number(intervalSeconds) || 300) * 1000;
  const nextRunAt = new Date(Date.now() + ms);
  pool.query('UPDATE city_service_loop_config SET next_run_at = ? WHERE id = 1', [nextRunAt]).catch(() => {});

  activeTimer = setTimeout(async () => {
    activeTimer = null;
    try {
      const cfg = await getConfig();
      if (cfg.status !== 'running') return;
      await runNextStep({ manual: false });
    } catch (err) {
      console.error('[CityServiceLoop Tick Error]', err.message);
      const cfg = await getConfig().catch(() => null);
      if (cfg && cfg.status === 'running') {
        scheduleNextTick(cfg.interval_seconds);
      }
    }
  }, ms);
  if (activeTimer.unref) activeTimer.unref();
}

async function startLoop({ runImmediately = true } = {}) {
  const cfg = await getConfig();
  await ensureCycleItems(cfg);

  // Si estaba en completed, iniciar siguiente vuelta
  if (cfg.status === 'completed') {
    const nextCycle = cfg.cycle_number + 1;
    await pool.query(
      `UPDATE city_service_loop_config
       SET status = 'running', cycle_number = ?, current_index = 0, current_step_message = 'Iniciando nueva vuelta...'
       WHERE id = 1`,
      [nextCycle]
    );
    const freshCfg = await getConfig();
    await ensureCycleItems(freshCfg);
  } else {
    await pool.query(
      `UPDATE city_service_loop_config
       SET status = 'running', current_step_message = 'Recorrido activo...'
       WHERE id = 1`
    );
  }

  const activeCfg = await getConfig();
  if (runImmediately && !isStepRunning) {
    // Disparar en segundo plano para responder rápido al navegador
    setImmediate(() => {
      runNextStep({ manual: false }).catch(err => console.error('[CityServiceLoop Start Error]', err.message));
    });
  } else {
    scheduleNextTick(activeCfg.interval_seconds);
  }
  return activeCfg;
}

async function pauseLoop() {
  clearTimer();
  await ensureTables();
  await pool.query(
    `UPDATE city_service_loop_config
     SET status = 'paused', next_run_at = NULL,
         current_step_message = IF(? = 1, 'Pausando al terminar el artículo actual...', 'Recorrido pausado por el usuario')
     WHERE id = 1`,
    [isStepRunning ? 1 : 0]
  );
  return getConfig();
}

async function skipItem(itemId = null) {
  const cfg = await getConfig();
  await ensureCycleItems(cfg);

  let target = null;
  if (itemId) {
    const [rows] = await pool.query('SELECT * FROM city_service_loop_items WHERE id = ? LIMIT 1', [itemId]);
    target = rows[0] || null;
  } else {
    target = await pickNextPendingItem(cfg);
  }

  if (!target) return { skipped: false };

  await pool.query(
    `UPDATE city_service_loop_items SET status = 'skipped', finished_at = NOW() WHERE id = ?`,
    [target.id]
  );

  if (!itemId || target.step_index >= cfg.current_index) {
    await pool.query(
      `UPDATE city_service_loop_config SET current_index = ?, current_step_message = ? WHERE id = 1`,
      [target.step_index + 1, `Saltado: ${target.provincia_nombre} · ${target.sector_nombre}`]
    );
  }

  return { skipped: true, item: target };
}

async function retryFailed(itemId = null) {
  const cfg = await getConfig();
  if (itemId) {
    const [res] = await pool.query(
      `UPDATE city_service_loop_items
       SET status = 'pending', error_message = NULL, finished_at = NULL
       WHERE id = ? AND status IN ('failed', 'skipped')`,
      [itemId]
    );
    return { retried: res.affectedRows };
  }
  const [res] = await pool.query(
    `UPDATE city_service_loop_items
     SET status = 'pending', error_message = NULL, finished_at = NULL
     WHERE cycle_number = ? AND status = 'failed'`,
    [cfg.cycle_number]
  );
  return { retried: res.affectedRows };
}

async function jumpToCity(provinciaSlug) {
  const cfg = await getConfig();
  await ensureCycleItems(cfg);

  const [rows] = await pool.query(
    `SELECT step_index, provincia_nombre, sector_nombre FROM city_service_loop_items
     WHERE cycle_number = ? AND provincia_slug = ? AND status = 'pending'
     ORDER BY step_index ASC LIMIT 1`,
    [cfg.cycle_number, provinciaSlug]
  );

  if (!rows || !rows.length) {
    return { jumped: false, message: 'Esa ciudad no tiene servicios pendientes en esta vuelta.' };
  }

  const target = rows[0];
  await pool.query(
    `UPDATE city_service_loop_config
     SET current_index = ?, current_provincia_slug = ?,
         current_step_message = ?
     WHERE id = 1`,
    [target.step_index, provinciaSlug, `Puntero movido a ${target.provincia_nombre} (${target.sector_nombre})`]
  );
  return { jumped: true, step_index: target.step_index, provincia_nombre: target.provincia_nombre };
}

async function resetCycle({ nextCycle = false } = {}) {
  clearTimer();
  const cfg = await getConfig();
  const targetCycle = nextCycle ? cfg.cycle_number + 1 : cfg.cycle_number;

  if (!nextCycle) {
    await pool.query('DELETE FROM city_service_loop_items WHERE cycle_number = ?', [targetCycle]);
  }

  await pool.query(
    `UPDATE city_service_loop_config
     SET status = 'paused', cycle_number = ?, current_index = 0,
         current_provincia_slug = NULL, current_sector_slug = NULL,
         next_run_at = NULL, current_step_message = ?
     WHERE id = 1`,
    [targetCycle, nextCycle ? `Nueva vuelta #${targetCycle} preparada.` : `Vuelta #${targetCycle} reiniciada desde cero.`]
  );

  const freshCfg = await getConfig();
  await ensureCycleItems(freshCfg);
  return freshCfg;
}

async function updateConfig(input = {}) {
  const current = await getConfig();
  const intervalSeconds = Math.max(15, Math.min(86400, parseInt(input.interval_seconds, 10) || current.interval_seconds));
  const orderMode = ['random', 'city_first', 'service_first'].includes(input.order_mode) ? input.order_mode : 'random';
  const contentMode = ['recomendados_ia', 'mixto', 'noticias', 'tendencias', 'curiosidades'].includes(input.content_mode)
    ? input.content_mode
    : 'recomendados_ia';
  const autoPublish = input.auto_publish === true || input.auto_publish === '1' || input.auto_publish === 'on' || input.auto_publish === 1 ? 1 : 0;
  const loopForever = input.loop_forever === true || input.loop_forever === '1' || input.loop_forever === 'on' || input.loop_forever === 1 ? 1 : 0;
  const useFallback = input.use_fallback === true || input.use_fallback === '1' || input.use_fallback === 'on' || input.use_fallback === 1 ? 1 : 0;

  let selectedProvinces = current.selected_provinces;
  if (input.selected_provinces !== undefined) {
    const arr = Array.isArray(input.selected_provinces)
      ? input.selected_provinces.filter(Boolean)
      : (typeof input.selected_provinces === 'string' && input.selected_provinces.trim()
          ? input.selected_provinces.split(',').map(s => s.trim()).filter(Boolean)
          : []);
    selectedProvinces = arr.length ? arr : null;
  }

  let selectedSectors = current.selected_sectors;
  if (input.selected_sectors !== undefined) {
    const arr = Array.isArray(input.selected_sectors)
      ? input.selected_sectors.filter(Boolean)
      : (typeof input.selected_sectors === 'string' && input.selected_sectors.trim()
          ? input.selected_sectors.split(',').map(s => s.trim()).filter(Boolean)
          : []);
    selectedSectors = arr.length ? arr : null;
  }

  const orderChanged =
    orderMode !== current.order_mode ||
    JSON.stringify(selectedProvinces) !== JSON.stringify(current.selected_provinces) ||
    JSON.stringify(selectedSectors) !== JSON.stringify(current.selected_sectors);

  await pool.query(
    `UPDATE city_service_loop_config
     SET interval_seconds = ?, order_mode = ?, content_mode = ?,
         auto_publish = ?, loop_forever = ?, use_fallback = ?,
         selected_provinces = ?, selected_sectors = ?
     WHERE id = 1`,
    [
      intervalSeconds,
      orderMode,
      contentMode,
      autoPublish,
      loopForever,
      useFallback,
      selectedProvinces ? JSON.stringify(selectedProvinces) : null,
      selectedSectors ? JSON.stringify(selectedSectors) : null,
    ]
  );

  // Si cambió el orden o el filtro y todavía no se había completado nada en esta vuelta, reconstruimos la cola del ciclo
  if (orderChanged) {
    const [[doneRow]] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM city_service_loop_items
       WHERE cycle_number = ? AND status IN ('completed', 'processing')`,
      [current.cycle_number]
    );
    if (Number(doneRow?.cnt || 0) === 0) {
      await pool.query('DELETE FROM city_service_loop_items WHERE cycle_number = ?', [current.cycle_number]);
      await pool.query('UPDATE city_service_loop_config SET current_index = 0 WHERE id = 1');
    }
  }

  const updated = await getConfig();
  await ensureCycleItems(updated);

  if (updated.status === 'running' && !isStepRunning) {
    scheduleNextTick(updated.interval_seconds);
  }
  return updated;
}

/**
 * Inicializa al arrancar el servidor: crea tablas, recupera pasos colgados y reanuda si estaba activo.
 */
async function init() {
  try {
    await ensureTables();
    const cfg = await getConfig();
    await ensureCycleItems(cfg);

    // Si el servidor se reinició a mitad de un paso 'processing', devolverlo a 'pending'
    await pool.query(
      `UPDATE city_service_loop_items SET status = 'pending' WHERE status = 'processing'`
    );

    if (cfg.status === 'running') {
      console.log(`[CityServiceLoop] Reanudando recorrido automático (Vuelta #${cfg.cycle_number}, intervalo ${cfg.interval_seconds}s)...`);
      scheduleNextTick(Math.min(cfg.interval_seconds, 30));
    }
  } catch (err) {
    console.error('[CityServiceLoop Init Error]', err.message);
  }
}

/**
 * Devuelve el estado completo del panel (resumen, actual, faltantes por ciudad, tabla filtrada).
 */
async function getDashboardState({
  filterStatus = '',
  filterProvincia = '',
  filterSector = '',
  search = '',
  page = 1,
  limit = 60,
} = {}) {
  const cfg = await getConfig();
  await ensureCycleItems(cfg);
  const cycle = cfg.cycle_number;

  // 1. Estadísticas globales de la vuelta actual
  const [[agg]] = await pool.query(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
       SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) AS processing,
       SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed,
       SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) AS skipped
     FROM city_service_loop_items
     WHERE cycle_number = ?`,
    [cycle]
  );

  const total = Number(agg?.total || 0);
  const completed = Number(agg?.completed || 0);
  const pending = Number(agg?.pending || 0);
  const processing = Number(agg?.processing || 0);
  const failed = Number(agg?.failed || 0);
  const skipped = Number(agg?.skipped || 0);
  const doneTotal = completed + skipped;
  const percent = total > 0 ? Math.round((doneTotal / total) * 1000) / 10 : 0;

  // 2. Elemento actual (processing o siguiente pending)
  const [procRows] = await pool.query(
    `SELECT * FROM city_service_loop_items WHERE cycle_number = ? AND status = 'processing' LIMIT 1`,
    [cycle]
  );
  const currentItem = (procRows && procRows[0]) || (await pickNextPendingItem(cfg));

  // 3. Próximos 6 elementos en cola
  const nextCursor = currentItem ? currentItem.step_index + 1 : cfg.current_index;
  const [nextItems] = await pool.query(
    `SELECT id, step_index, provincia_slug, provincia_nombre, sector_slug, sector_nombre, status
     FROM city_service_loop_items
     WHERE cycle_number = ? AND status = 'pending' AND step_index >= ?
     ORDER BY step_index ASC LIMIT 6`,
    [cycle, nextCursor]
  );

  // 4. Últimos 6 artículos generados en esta vuelta
  const [recentCompleted] = await pool.query(
    `SELECT id, step_index, provincia_slug, provincia_nombre, sector_slug, sector_nombre,
            source_type, source_title, source_url, post_id, post_slug, post_title, finished_at
     FROM city_service_loop_items
     WHERE cycle_number = ? AND status = 'completed'
     ORDER BY finished_at DESC, id DESC LIMIT 6`,
    [cycle]
  );

  // 5. Progreso agrupado por ciudad (para ver cuáles están hechas, por cuál va y cuáles faltan)
  const [cityRows] = await pool.query(
    `SELECT
       provincia_slug,
       provincia_nombre,
       MIN(step_index) AS first_step,
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
       SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) AS processing,
       SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed,
       SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) AS skipped
     FROM city_service_loop_items
     WHERE cycle_number = ?
     GROUP BY provincia_slug, provincia_nombre
     ORDER BY first_step ASC`,
    [cycle]
  );

  const cityProgress = (cityRows || []).map(c => {
    const cTotal = Number(c.total || 0);
    const cCompleted = Number(c.completed || 0);
    const cPending = Number(c.pending || 0);
    const cProcessing = Number(c.processing || 0);
    const cFailed = Number(c.failed || 0);
    const cSkipped = Number(c.skipped || 0);
    let cityState = 'pending';
    if (cProcessing > 0 || (currentItem && currentItem.provincia_slug === c.provincia_slug && cPending > 0)) {
      cityState = 'active';
    } else if (cPending === 0 && cProcessing === 0) {
      cityState = cFailed > 0 ? 'partial' : 'completed';
    } else if (cCompleted > 0 || cSkipped > 0) {
      cityState = 'in_progress';
    }
    return {
      provincia_slug: c.provincia_slug,
      provincia_nombre: c.provincia_nombre,
      total: cTotal,
      completed: cCompleted,
      pending: cPending,
      processing: cProcessing,
      failed: cFailed,
      skipped: cSkipped,
      percent: cTotal > 0 ? Math.round(((cCompleted + cSkipped) / cTotal) * 100) : 0,
      state: cityState,
    };
  });

  const citiesCompleted = cityProgress.filter(c => c.state === 'completed').length;
  const citiesRemaining = cityProgress.length - citiesCompleted;

  // 6. Tabla detallada filtrable y paginada
  const where = ['cycle_number = ?'];
  const params = [cycle];

  if (filterStatus && ['pending', 'processing', 'completed', 'failed', 'skipped'].includes(filterStatus)) {
    where.push('status = ?');
    params.push(filterStatus);
  }
  if (filterProvincia) {
    where.push('provincia_slug = ?');
    params.push(filterProvincia);
  }
  if (filterSector) {
    where.push('sector_slug = ?');
    params.push(filterSector);
  }
  if (search && search.trim()) {
    where.push('(provincia_nombre LIKE ? OR sector_nombre LIKE ? OR post_title LIKE ? OR source_title LIKE ?)');
    const like = `%${search.trim()}%`;
    params.push(like, like, like, like);
  }

  const whereSql = where.join(' AND ');
  const safeLimit = Math.min(200, Math.max(10, parseInt(limit, 10) || 60));
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (safePage - 1) * safeLimit;

  const [[filteredCountRow]] = await pool.query(
    `SELECT COUNT(*) AS cnt FROM city_service_loop_items WHERE ${whereSql}`,
    params
  );
  const filteredTotal = Number(filteredCountRow?.cnt || 0);

  const [items] = await pool.query(
    `SELECT * FROM city_service_loop_items
     WHERE ${whereSql}
     ORDER BY step_index ASC
     LIMIT ? OFFSET ?`,
    [...params, safeLimit, offset]
  );

  const secondsUntilNextRun =
    cfg.status === 'running' && cfg.next_run_at && !isStepRunning
      ? Math.max(0, Math.round((new Date(cfg.next_run_at).getTime() - Date.now()) / 1000))
      : null;

  return {
    config: {
      ...cfg,
      isStepRunning,
      liveStepMessage: liveStepMessage || cfg.current_step_message || 'En espera',
      liveCurrentItemId,
      secondsUntilNextRun,
    },
    stats: {
      total,
      completed,
      pending,
      processing,
      failed,
      skipped,
      remaining: pending + processing,
      percent,
      citiesTotal: cityProgress.length,
      citiesCompleted,
      citiesRemaining,
    },
    currentItem,
    nextItems: nextItems || [],
    recentCompleted: recentCompleted || [],
    cityProgress,
    items: items || [],
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: filteredTotal,
      totalPages: Math.max(1, Math.ceil(filteredTotal / safeLimit)),
    },
  };
}

module.exports = {
  ensureTables,
  init,
  getConfig,
  updateConfig,
  startLoop,
  pauseLoop,
  runNextStep,
  skipItem,
  retryFailed,
  jumpToCity,
  resetCycle,
  getDashboardState,
  buildMatrix,
  discoverNewsOrCuriosity,
};
