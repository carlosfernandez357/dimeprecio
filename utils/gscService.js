const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const pool = require('../db');

const KEY_FILE = path.join(__dirname, '..', 'google-search-console.json');
const SITE_URL = 'sc-domain:dimeprecio.es';

let authClient = null;
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getAuth() {
  if (authClient) return authClient;
  if (!fs.existsSync(KEY_FILE)) {
    throw new Error('Archivo google-search-console.json no encontrado.');
  }
  authClient = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  return authClient;
}

/**
 * Consulta el rendimiento de Search Console para un rango de días y dimensión dada.
 */
async function getSearchPerformance({ days = 7, dimension = 'query', limit = 100 } = {}) {
  const cacheKey = `${days}_${dimension}_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  const auth = getAuth();
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() - 2);

  const start = new Date(end);
  start.setDate(start.getDate() - (Number(days) - 1));

  const startDate = start.toISOString().split('T')[0];
  const endDate = end.toISOString().split('T')[0];

  const dim = dimension === 'page' ? 'page' : 'query';

  const res = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: [dim],
      rowLimit: Math.min(Math.max(Number(limit) || 100, 10), 500),
      aggregationType: 'auto',
    },
  });

  const rawRows = res.data.rows || [];

  let totalClicks = 0;
  let totalImpressions = 0;
  let sumPosition = 0;

  const rows = rawRows.map(r => {
    const key = (r.keys && r.keys[0]) || '';
    const clicks = Number(r.clicks) || 0;
    const impressions = Number(r.impressions) || 0;
    const ctr = ((Number(r.ctr) || 0) * 100).toFixed(2);
    const position = (Number(r.position) || 0).toFixed(1);

    totalClicks += clicks;
    totalImpressions += impressions;
    sumPosition += (Number(r.position) || 0);

    return {
      item: key,
      clicks,
      impressions,
      ctr,
      position,
    };
  });

  const avgPosition = rows.length > 0 ? (sumPosition / rows.length).toFixed(1) : '0.0';
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  const result = {
    ok: true,
    siteUrl: SITE_URL,
    dateRange: {
      startDate,
      endDate,
      days: Number(days),
    },
    totals: {
      totalClicks,
      totalImpressions,
      avgCtr,
      avgPosition,
      totalRows: rows.length,
    },
    dimension: dim,
    rows,
  };

  cache.set(cacheKey, { timestamp: Date.now(), data: result });
  return result;
}

/**
 * Sincroniza las consultas desde Google Search Console hacia la tabla `gsc_queries` en MySQL.
 */
async function syncQueriesToDatabase({ days = 28, limit = 500 } = {}) {
  const gscData = await getSearchPerformance({ days, dimension: 'query', limit });
  if (!gscData || !gscData.rows || !gscData.rows.length) {
    return { syncedCount: 0, totalRows: 0 };
  }

  let syncedCount = 0;
  for (const r of gscData.rows) {
    if (!r.item || !r.item.trim()) continue;
    const qText = r.item.trim().substring(0, 255);
    try {
      await pool.query(
        `INSERT INTO gsc_queries (query_text, clicks, impressions, ctr, position, last_seen_at)
         VALUES (?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE 
           clicks = VALUES(clicks),
           impressions = VALUES(impressions),
           ctr = VALUES(ctr),
           position = VALUES(position),
           last_seen_at = NOW()`,
        [qText, r.clicks || 0, r.impressions || 0, r.ctr || 0, r.position || 0]
      );
      syncedCount++;
    } catch (err) {
      console.error('[GSC Sync Row Error]', qText, err.message);
    }
  }

  return { syncedCount, totalRows: gscData.rows.length };
}

/**
 * Obtiene las consultas almacenadas en MySQL con sus estadísticas y número de usos.
 */
async function getStoredQueries({ status = '', search = '', limit = 500, offset = 0, sortBy = 'impressions', sortOrder = 'DESC' } = {}) {
  // Asegurar tabla existente
  await pool.query(`
    CREATE TABLE IF NOT EXISTS gsc_queries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      query_text VARCHAR(255) NOT NULL UNIQUE,
      clicks INT DEFAULT 0,
      impressions INT DEFAULT 0,
      ctr DECIMAL(5,2) DEFAULT 0.00,
      position DECIMAL(5,1) DEFAULT 0.0,
      used_count INT DEFAULT 0,
      last_used_at DATETIME NULL,
      is_selected TINYINT DEFAULT 1,
      status VARCHAR(30) DEFAULT 'pending',
      first_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_impressions (impressions),
      INDEX idx_used (used_count),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  let whereClauses = ['1=1'];
  const params = [];

  if (status === 'pending') {
    whereClauses.push('used_count = 0');
  } else if (status === 'used') {
    whereClauses.push('used_count > 0');
  }

  if (search && search.trim()) {
    whereClauses.push('query_text LIKE ?');
    params.push(`%${search.trim()}%`);
  }

  const allowedSorts = ['impressions', 'clicks', 'ctr', 'position', 'used_count', 'last_used_at'];
  const safeSort = allowedSorts.includes(sortBy) ? sortBy : 'impressions';
  const safeOrder = String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const whereSql = whereClauses.join(' AND ');

  const [rows] = await pool.query(
    `SELECT * FROM gsc_queries WHERE ${whereSql} ORDER BY ${safeSort} ${safeOrder} LIMIT ? OFFSET ?`,
    [...params, Number(limit) || 500, Number(offset) || 0]
  );

  // Totales agregados
  const [[totals]] = await pool.query(`
    SELECT 
      COUNT(*) as totalQueries,
      SUM(CASE WHEN used_count > 0 THEN 1 ELSE 0 END) as totalUsed,
      SUM(CASE WHEN used_count = 0 THEN 1 ELSE 0 END) as totalPending,
      SUM(impressions) as totalImpressions,
      SUM(clicks) as totalClicks
    FROM gsc_queries
  `);

  return {
    rows: rows || [],
    totals: totals || { totalQueries: 0, totalUsed: 0, totalPending: 0, totalImpressions: 0, totalClicks: 0 }
  };
}

/**
 * Incrementa el contador de usos de una consulta.
 */
async function markQueryUsed(queryText) {
  if (!queryText) return;
  await pool.query(
    `UPDATE gsc_queries 
     SET used_count = used_count + 1, last_used_at = NOW(), status = 'completed' 
     WHERE query_text = ?`,
    [queryText.trim()]
  );
}

/**
 * Genera un artículo de IA a partir de una consulta de búsqueda y lo guarda en la base de datos.
 */
async function generateArticleFromQuery(queryText, options = {}) {
  const rr = require('./rankRentEngine');
  const ai = require('./ai');
  const imageManager = require('./imageManager');

  const text = String(queryText || '').trim();
  if (!text) throw new Error('Consulta vacía');

  // Detectar provincia en el texto o usar una predeterminada
  const locations = rr.getLocations(false);
  let detectedProv = locations.find(l => {
    const norm = l.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normQ = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normQ.includes(norm);
  }) || rr.getLocationBySlug('madrid');

  // Detectar sector en el texto
  const sectors = rr.getSectors(false);
  let detectedSector = sectors.find(s => {
    const norm = s.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normQ = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normQ.includes(norm) || (s.slug && normQ.includes(s.slug.replace(/-/g, ' ')));
  }) || sectors[0];

  const provSlug = options.provincia_slug || detectedProv.slug;
  const secSlug = options.sector_slug || detectedSector.slug;

  const generated = await ai.generateArticle(text, {
    provinciaSlug: provSlug,
    sectorSlug: secSlug,
    category: detectedSector.nombre,
  });

  const cap = text.charAt(0).toUpperCase() + text.slice(1);
  const title = generated.title || `${cap}: Precios y Guía (2026)`;
  const slug = (generated.slug || rr.slugify(text)) + '-' + Date.now().toString(36);
  const excerpt = generated.excerpt || generated.meta_description || `Consulta precios y opciones para ${text} en DimePrecio.es.`;
  const content = generated.content || `<p>Guía de precios y opciones para ${text}.</p>`;
  const featured_image = generated.image || imageManager.getRandomFallbackImage(slug);

  const [ins] = await pool.query(
    `INSERT INTO posts (title, slug, excerpt, content, featured_image, image_alt, category_id, author_id, status, is_featured, is_breaking, meta_title, meta_description, keywords, published_at, provincia_slug, sector_slug)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', 1, 0, ?, ?, ?, NOW(), ?, ?)`,
    [
      title,
      slug,
      excerpt,
      content,
      featured_image,
      title,
      1,
      1,
      generated.meta_title || title,
      generated.meta_description || excerpt,
      text,
      provSlug,
      secSlug
    ]
  );

  const postId = ins.insertId;

  if (postId) {
    rr.updatePostAlgorithmSettings(postId, {
      is_pinned: 0,
      is_selected: 1,
      priority_weight: 9,
      provincia_slug: provSlug,
      sector_slug: secSlug,
    });

    await ai.savePostExtras(postId, {
      evergreen: 9,
      depth: 8,
      provincia_slug: provSlug,
      sector_slug: secSlug,
      topics: generated.topicsString || `${detectedSector.nombre}:9`,
      tags: text,
      content,
    });
  }

  // Registrar uso en la tabla de queries
  await markQueryUsed(text);

  return {
    id: postId,
    title,
    slug,
    query: text,
  };
}

/**
 * Genera un lote de artículos para las consultas seleccionadas o para las N primeras pendientes.
 */
async function generateBatch({ queries = [], limit = 100 } = {}) {
  let list = [];
  if (queries && queries.length > 0) {
    list = queries;
  } else {
    // Tomar las N primeras con más impresiones que no hayan sido usadas
    const [dbRows] = await pool.query(
      'SELECT query_text FROM gsc_queries WHERE used_count = 0 ORDER BY impressions DESC LIMIT ?',
      [Number(limit) || 100]
    );
    list = (dbRows || []).map(r => r.query_text);
  }

  const results = {
    total: list.length,
    success: 0,
    failed: 0,
    articles: [],
    errors: [],
  };

  for (const qText of list) {
    try {
      const art = await generateArticleFromQuery(qText);
      results.success++;
      results.articles.push(art);
      console.log(`[GSC Batch] Creado artículo #${art.id}: "${art.title}" para "${qText}"`);
    } catch (err) {
      results.failed++;
      results.errors.push({ query: qText, error: err.message });
      console.error(`[GSC Batch Error] Error con "${qText}":`, err.message);
    }
  }

  return results;
}

module.exports = {
  getSearchPerformance,
  syncQueriesToDatabase,
  getStoredQueries,
  markQueryUsed,
  generateArticleFromQuery,
  generateBatch,
  SITE_URL,
};