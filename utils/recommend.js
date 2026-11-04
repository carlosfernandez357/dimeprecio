// ============================================================================
// PidePrecio.es — Algoritmo de Recomendación SocialsForce Mejorado
// Combina las señales de comportamiento de SocialsForce (tiempo activo de
// lectura, scroll, CTR de impresiones/clics, afinidad de categorías/sectores,
// frescura/evergreen) con la zona detectada del usuario y la selección de Admin.
// ============================================================================
const pool = require('../db');
const rr = require('./rankRentEngine');

// Almacén en memoria de telemetría de lectura e impresiones (estilo SocialsForce tracker.js)
const visitorProfiles = new Map(); // uid -> { cats: Map<string, number>, seen: Set<number>, provs: Map<string, number> }
const postStats = new Map(); // postId -> { impressions: number, clicks: number, activeSeconds: number, maxScrollSum: number, reads: number }
const impressionLog = new Map(); // impId -> { pid, pl, pos, uid }
let nextImpId = 1;

function getOrCreateProfile(uid) {
  const key = uid || 'anon';
  if (!visitorProfiles.has(key)) {
    visitorProfiles.set(key, {
      cats: new Map(),
      seen: new Set(),
      provs: new Map(),
    });
  }
  return visitorProfiles.get(key);
}

function getOrCreatePostStat(pid) {
  const id = Number(pid);
  if (!postStats.has(id)) {
    postStats.set(id, { impressions: 10, clicks: 2, activeSeconds: 45, maxScrollSum: 70, reads: 1 });
  }
  return postStats.get(id);
}

// Registrar visita explícita a un sector o artículo en memoria y en Base de Datos (`pp_visitor_interests`)
async function recordSectorVisit(uid, provinciaSlug, sectorSlug, postId = null) {
  if (!sectorSlug) return;
  const key = uid || 'anon';
  const profile = getOrCreateProfile(key);
  profile.cats.set(sectorSlug, (profile.cats.get(sectorSlug) || 0) + 5);
  if (provinciaSlug) {
    profile.provs.set(provinciaSlug, (profile.provs.get(provinciaSlug) || 0) + 4);
  }
  if (postId) {
    profile.seen.add(Number(postId));
  }
  try {
    await pool.query(
      'INSERT INTO pp_visitor_interests (visitor_id, provincia_slug, sector_slug, last_post_id) VALUES (?, ?, ?, ?)',
      [key, provinciaSlug || 'madrid', sectorSlug, postId ? Number(postId) : null]
    );
  } catch (e) {}
}

// Resolver los sectores vistos por el cliente (combinando Base de Datos + Cookies + Telemetría en vivo)
function resolvePreferredSectors(uid, cookies = {}) {
  const ordered = [];
  const addUnique = slug => {
    if (!slug) return;
    const sec = rr.getSectorBySlug(slug);
    if (sec && !ordered.includes(sec.slug)) {
      ordered.push(sec.slug);
    }
  };

  // 1. Último sector visto en cookie inmediata
  if (cookies && cookies.pp_last_sector) {
    addUnique(cookies.pp_last_sector);
  }

  // 2. Historial persistido en Base de Datos (`pp_visitor_interests`)
  if (uid) {
    const dbInterests = rr.getVisitorInterests(uid);
    for (const item of dbInterests) {
      addUnique(item.sector_slug);
    }
  }

  // 3. Lista de sectores vistos en cookie (`pp_seen_sectors`)
  if (cookies && cookies.pp_seen_sectors) {
    String(cookies.pp_seen_sectors)
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .forEach(addUnique);
  }

  // 4. Perfil de telemetría SocialsForce en memoria
  if (uid && visitorProfiles.has(uid)) {
    const prof = visitorProfiles.get(uid);
    const sortedCats = Array.from(prof.cats.entries()).sort((a, b) => b[1] - a[1]);
    for (const [catSlug] of sortedCats) {
      addUnique(catSlug);
    }
  }

  return ordered;
}

// Registrar evento de lectura desde /api/track (enviado por public/js/tracker.js)
function recordTrackEvent(uid, payload = {}) {
  const pid = Number(payload.pid);
  if (!pid) return { vid: null };
  const profile = getOrCreateProfile(uid);
  const stat = getOrCreatePostStat(pid);

  if (payload.t === 'start') {
    profile.seen.add(pid);
    stat.reads++;
    const store = rr.loadStore();
    const post = (store.posts || []).find(p => Number(p.id) === pid);
    if (post) {
      const secKey = post.sector_slug || post.category_slug || post.category;
      if (secKey) profile.cats.set(secKey, (profile.cats.get(secKey) || 0) + 2);
      if (post.provincia_slug) profile.provs.set(post.provincia_slug, (profile.provs.get(post.provincia_slug) || 0) + 2);
    }
    return { vid: `v-${pid}-${Date.now()}` };
  }

  if (payload.t === 'ping' || payload.t === 'end') {
    const as = Number(payload.as) || 0;
    const sp = Number(payload.sp) || 0;
    stat.activeSeconds = Math.max(stat.activeSeconds, as);
    stat.maxScrollSum = Math.max(stat.maxScrollSum, sp);
  }
  return { vid: payload.vid || `v-${pid}` };
}

// Registrar impresiones desde /api/rec/impressions (tracker.js)
function recordImpressions(uid, items = []) {
  const ids = [];
  for (const item of items) {
    const pid = Number(item.pid);
    if (!pid) {
      ids.push(null);
      continue;
    }
    const stat = getOrCreatePostStat(pid);
    stat.impressions++;
    const impId = `imp_${nextImpId++}`;
    impressionLog.set(impId, { pid, pl: item.pl, pos: item.pos, uid });
    ids.push(impId);
  }
  return ids;
}

// Registrar clic en recomendación desde /api/rec/click (tracker.js)
function recordClick(uid, impId) {
  const entry = impressionLog.get(String(impId));
  if (!entry) return false;
  const stat = getOrCreatePostStat(entry.pid);
  stat.clicks++;
  const profile = getOrCreateProfile(uid || entry.uid);
  const store = rr.loadStore();
  const post = (store.posts || []).find(p => Number(p.id) === Number(entry.pid));
  if (post) {
    const secKey = post.sector_slug || post.category_slug || post.category;
    if (secKey) profile.cats.set(secKey, (profile.cats.get(secKey) || 0) + 3);
    if (post.provincia_slug) profile.provs.set(post.provincia_slug, (profile.provs.get(post.provincia_slug) || 0) + 3);
  }
  return true;
}

// Normaliza un post para que funcione con todas las plantillas de SocialsForce y PidePrecio.es
function normalizePost(p) {
  if (!p) return p;
  const img = p.featured_image || p.image || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=900&q=80';
  const cat = p.sector_nombre || p.category_name || p.category || 'Presupuestos';
  return {
    ...p,
    image: img,
    featured_image: img,
    category: cat,
    category_name: cat,
    category_slug: p.sector_slug || p.category_slug || rr.slugify(cat),
  };
}

// Cálculo de puntuación multi-señal estilo SocialsForce + Zona + Selección Admin
function scorePost(p, { uid = null, provinciaSlug = null, sectorSlug = null, clientCats = [] } = {}) {
  const store = rr.loadStore();
  const cfg = store.settings?.algorithm_config || {
    peso_provincia_detectada: 45,
    peso_anuncio_seleccionado: 35,
    peso_afinidad_sector: 25,
    peso_prioridad_manual: 20,
    peso_popularidad: 10,
  };

  const profile = getOrCreateProfile(uid);
  const stat = getOrCreatePostStat(p.id);
  let score = 10;

  // 0. Página fijada manualmente desde Admin (Fijada siempre arriba)
  if (p.is_pinned) {
    score += Number(cfg.peso_fijados) || 65;
  }

  // 1. Coincidencia con la provincia detectada o navegada por el usuario
  if (provinciaSlug && p.provincia_slug === provinciaSlug) {
    score += Number(cfg.peso_provincia_detectada) || 45;
  } else if (profile.provs.has(p.provincia_slug)) {
    score += Math.min(25, (profile.provs.get(p.provincia_slug) || 0) * 6);
  }

  // 2. Selección manual del administrador ("Recomendada")
  if (p.is_selected) {
    score += Number(cfg.peso_anuncio_seleccionado) || 40;
  }

  // 3. Afinidad de sector / sección (actual + historial de lectura en BD/Cookies/SocialsForce)
  const pSec = p.sector_slug || p.category_slug;
  if (sectorSlug && pSec === sectorSlug) {
    score += (Number(cfg.peso_afinidad_sector) || 30) * 2.2;
  }
  if (Array.isArray(clientCats) && clientCats.length) {
    const idx = clientCats.indexOf(pSec);
    if (idx === 0) {
      score += (Number(cfg.peso_afinidad_sector) || 30) * 1.9; // Último sector visto (ej. Aire Acondicionado)
    } else if (idx > 0) {
      score += Math.max(15, (Number(cfg.peso_afinidad_sector) || 30) * 1.3 - idx * 4);
    }
  }
  if (profile.cats.has(pSec)) {
    score += Math.min(28, (profile.cats.get(pSec) || 0) * 6);
  }

  // 4. Prioridad editorial manual (1-10)
  score += ((Number(p.priority_weight) || 5) / 10) * (Number(cfg.peso_prioridad_manual) || 20);

  // 5. CTR Bayesiano + Calidad de lectura (tiempo activo y scroll de SocialsForce)
  const ctr = (stat.clicks + 1.5) / (stat.impressions + 12);
  const qualityRead = Math.min(1.5, (stat.activeSeconds / 60) * 0.7 + (stat.maxScrollSum / 100) * 0.5);
  score += ctr * 40 + qualityRead * 8;

  // 6. Popularidad y Evergreen
  score += Math.min(14, ((Number(p.views) || 0) / 450) * (Number(cfg.peso_popularidad) || 10));

  // Pequeña penalización si el usuario ya lo acaba de leer para favorecer descubrimiento
  if (profile.seen.has(Number(p.id))) {
    score -= 8;
  }

  return Math.round(score * 100) / 100;
}

async function getForYou(visitorUid, limit = 6, excludePostIds = [], context = {}) {
  try {
    const [posts] = await pool.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug, c.color as category_color
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'published'
      ORDER BY p.published_at DESC
      LIMIT 250
    `);

    const preferredSectors = resolvePreferredSectors(visitorUid, context.cookies || {});
    const combinedCats = Array.from(new Set([...(context.clientCats || []), ...preferredSectors]));

    const filtered = (posts || [])
      .filter(p => !excludePostIds.includes(Number(p.id)))
      .map(normalizePost);

    const scored = filtered.map(p => ({
      ...p,
      _algo_score: scorePost(p, {
        uid: visitorUid,
        provinciaSlug: context.provinciaSlug || null,
        sectorSlug: context.sectorSlug || (preferredSectors[0] || null),
        clientCats: combinedCats,
      }),
    }));

    scored.sort((a, b) => b._algo_score - a._algo_score);
    return scored.slice(0, limit);
  } catch (err) {
    console.error('[Recommend] Error in getForYou:', err.message);
    return getTrending(limit, excludePostIds, context);
  }
}

async function getTrending(limit = 6, excludeIds = [], context = {}) {
  try {
    const provSlug = context.provinciaSlug || null;
    const secSlug = context.sectorSlug || null;
    const [rows] = await pool.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug, c.color as category_color
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'published'
      ORDER BY p.views DESC
      LIMIT 60
    `);

    const filtered = (rows || [])
      .filter(r => !excludeIds.includes(Number(r.id)))
      .map(normalizePost);

    filtered.sort((a, b) => {
      const aPin = a.is_pinned ? 55 : 0;
      const bPin = b.is_pinned ? 55 : 0;
      const aProv = provSlug && a.provincia_slug === provSlug ? 38 : 0;
      const bProv = provSlug && b.provincia_slug === provSlug ? 38 : 0;
      const aSec = secSlug && a.sector_slug === secSlug ? 28 : 0;
      const bSec = secSlug && b.sector_slug === secSlug ? 28 : 0;
      const aSel = a.is_selected ? 25 : 0;
      const bSel = b.is_selected ? 25 : 0;
      const aScore = aPin + aProv + aSec + aSel + (Number(a.views) || 0) * 0.04;
      const bScore = bPin + bProv + bSec + bSel + (Number(b.views) || 0) * 0.04;
      return bScore - aScore;
    });

    return filtered.slice(0, limit);
  } catch (err) {
    console.error('[Recommend] Error in getTrending:', err.message);
    return [];
  }
}

async function getRelated(postId, categoryId, limit = 4, context = {}) {
  try {
    const provSlug = context.provinciaSlug || null;
    const secSlug = context.sectorSlug || null;
    const [rows] = await pool.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug, c.color as category_color
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'published'
      ORDER BY p.published_at DESC
      LIMIT 60
    `);

    const candidates = (rows || [])
      .filter(p => Number(p.id) !== Number(postId))
      .map(normalizePost);

    candidates.sort((a, b) => {
      let scoreA = (a.is_selected ? 20 : 0) + (Number(a.category_id) === Number(categoryId) ? 15 : 0);
      let scoreB = (b.is_selected ? 20 : 0) + (Number(b.category_id) === Number(categoryId) ? 15 : 0);
      if (provSlug && a.provincia_slug === provSlug) scoreA += 38;
      if (provSlug && b.provincia_slug === provSlug) scoreB += 38;
      if (secSlug && a.sector_slug === secSlug) scoreA += 32;
      if (secSlug && b.sector_slug === secSlug) scoreB += 32;
      return scoreB - scoreA;
    });

    return candidates.slice(0, limit);
  } catch (err) {
    console.error('[Recommend] Error in getRelated:', err.message);
    return [];
  }
}

function getRecommendedAds(options = {}) {
  return rr.getRecommendedAds(options);
}

// Construye los datos de `sidebar.ejs` (estilo SocialsForce) adaptados a la zona/sector actual
async function buildSidebarData({ provinciaSlug = null, sectorSlug = null, currentCategoryName = null } = {}) {
  const trending = await getTrending(5, [], { provinciaSlug, sectorSlug });
  const sectors = rr.getSectors(true);
  let sidebarCategory = null;

  if (sectorSlug || currentCategoryName) {
    const secPosts = await getForYou(null, 4, [], { provinciaSlug, sectorSlug });
    sidebarCategory = {
      name: currentCategoryName || (sectors.find(s => s.slug === sectorSlug)?.nombre) || 'Destacados',
      slug: sectorSlug || rr.slugify(currentCategoryName || 'destacados'),
      posts: secPosts,
    };
  }

  return {
    sidebarCategory,
    sidebarTrending: trending,
    sidebarCategories: sectors.slice(0, 12).map(s => s.nombre),
  };
}

// Construye los datos de `home-extras.ejs` (ticker, carousel, duoPairs, spotlight, discover) estilo SocialsForce
async function buildHomeExtrasData({ provinciaSlug = null, visitorUid = null, cookies = {} } = {}) {
  const seenSectors = resolvePreferredSectors(visitorUid, cookies);
  const allPosts = await getForYou(visitorUid, 48, [], {
    provinciaSlug,
    clientCats: seenSectors,
    cookies,
  });
  const globalPosts = await getForYou(visitorUid, 80, [], {
    provinciaSlug: null,
    clientCats: seenSectors,
    cookies,
  });
  const sectors = rr.getSectors(true);
  const locations = rr.getLocations(true);

  // Ordenar sectores priorizando los que el usuario ya ha consultado
  const orderedSectors = [...sectors].sort((a, b) => {
    const idxA = seenSectors.indexOf(a.slug);
    const idxB = seenSectors.indexOf(b.slug);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });

  // Agrupar por sectores principales asegurando hasta 4 páginas por sector para grids completos
  const bySector = [];
  for (const sec of orderedSectors.slice(0, 8)) {
    const localSecPosts = allPosts.filter(p => p.sector_slug === sec.slug);
    const seenIds = new Set(localSecPosts.map(p => p.id || p.slug));
    const extraSecPosts = globalPosts
      .filter(p => p.sector_slug === sec.slug && !seenIds.has(p.id || p.slug))
      .slice(0, Math.max(0, 4 - localSecPosts.length));
    const combined = [...localSecPosts, ...extraSecPosts].slice(0, 4);
    if (combined.length >= 2) {
      bySector.push({
        name: sec.nombre,
        slug: sec.slug,
        posts: combined,
        total: combined.length,
      });
    }
  }

  const duoPairs = [];
  for (let i = 0; i + 1 < bySector.length && duoPairs.length < 2; i += 2) {
    duoPairs.push([bySector[i], bySector[i + 1]]);
  }

  return {
    ticker: allPosts.slice(0, 8),
    totals: {
      posts: allPosts.length,
      cats: sectors.length,
      provinces: locations.length,
    },
    carousel: allPosts.slice(0, 10),
    recommended: bySector[0] || null,
    catStats: orderedSectors.slice(0, 8).map((sec, idx) => ({
      name: sec.nombre,
      slug: sec.slug,
      total: Math.max(4, 18 - idx * 2),
    })),
    duoPairs,
    spotlight: bySector[2] || bySector[0] || null,
    popular: allPosts.slice(0, 6),
    discover: allPosts.slice(0, 5),
    recentMore: allPosts.slice(5, 11),
  };
}

module.exports = {
  getForYou,
  getTrending,
  getRelated,
  getRecommendedAds,
  normalizePost,
  recordSectorVisit,
  resolvePreferredSectors,
  recordTrackEvent,
  recordImpressions,
  recordClick,
  buildSidebarData,
  buildHomeExtrasData,
};
