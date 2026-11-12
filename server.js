require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');

const pool = require('./db');
const { generateArticle, generateImage } = require('./utils/ai');
const {
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
} = require('./utils/recommend');
const rr = require('./utils/rankRentEngine');
const {
  geoDetectorMiddleware,
  detectLocationFromRequest,
  resolveProvinceByCoordinates,
  matchProvinceByPostalCode,
  matchProvinceByText,
} = require('./utils/geoDetector');

const uuidv4 = () => crypto.randomUUID();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const SITE_URL = (process.env.SITE_URL || 'https://dimeprecio.es').toLowerCase().replace(/\/$/, '');

// Asegurar carpetas de subidas (imágenes de artículos y formularios/presupuestos de clientes)
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
// Archivos de clientes (presupuestos): FUERA de /public, solo accesibles desde el admin autenticado
const FORMS_UPLOAD_DIR = path.join(__dirname, 'private', 'uploads', 'forms');
const LEGACY_FORMS_DIR = path.join(UPLOADS_DIR, 'forms');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(FORMS_UPLOAD_DIR)) fs.mkdirSync(FORMS_UPLOAD_DIR, { recursive: true });
// Migrar archivos que estuvieran antes en public/uploads/forms
if (fs.existsSync(LEGACY_FORMS_DIR)) {
  for (const f of fs.readdirSync(LEGACY_FORMS_DIR)) {
    try { fs.renameSync(path.join(LEGACY_FORMS_DIR, f), path.join(FORMS_UPLOAD_DIR, f)); } catch (e) { console.error('[Migración uploads]', e.message); }
  }
  try { fs.rmdirSync(LEGACY_FORMS_DIR); } catch (e) {}
}

const FORM_ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];
const IMAGE_ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// Parser nativo de multipart/form-data para subida de formularios, documentos y fotos sin dependencias externas
function createMultipartHandler(destDir, allowedExt) {
  function parseMultipartRequest(req, res, next) {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      req.files = [];
      return next();
    }
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!boundaryMatch) {
      req.files = [];
      return next();
    }
    const boundary = '--' + (boundaryMatch[1] || boundaryMatch[2]).trim();
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        req.body = req.body || {};
        req.files = [];

        const rawStr = buffer.toString('latin1');
        const parts = rawStr.split(boundary).slice(1, -1);

        for (const part of parts) {
          const cleaned = part.replace(/^\r\n/, '').replace(/\r\n$/, '');
          const headerEndIdx = cleaned.indexOf('\r\n\r\n');
          if (headerEndIdx === -1) continue;

          const headerStr = cleaned.slice(0, headerEndIdx);
          const bodyLatin1 = cleaned.slice(headerEndIdx + 4);

          const nameMatch = headerStr.match(/name="([^"]+)"/i);
          if (!nameMatch) continue;
          const fieldName = nameMatch[1];
          const filenameMatch = headerStr.match(/filename="([^"]*)"/i);

          if (filenameMatch && filenameMatch[1]) {
            const origName = Buffer.from(filenameMatch[1], 'latin1').toString('utf8');
            const safeName = `pp-${Date.now()}-${Math.round(Math.random() * 1e4)}-${origName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
            const fileBuffer = Buffer.from(bodyLatin1, 'latin1');
            const ext = path.extname(origName).toLowerCase();
            if (allowedExt && !allowedExt.includes(ext)) continue;
            if (fileBuffer.length > MAX_UPLOAD_BYTES) continue;
            if (fileBuffer.length > 0) {
              const fullPath = path.join(destDir, safeName);
              fs.writeFileSync(fullPath, fileBuffer);
              const fileObj = {
                fieldname: fieldName,
                originalname: origName,
                filename: safeName,
                path: fullPath,
                size: fileBuffer.length,
              };
              req.files.push(fileObj);
              if (!req.file) req.file = fileObj;
            }
          } else {
            const valUtf8 = Buffer.from(bodyLatin1, 'latin1').toString('utf8');
            req.body[fieldName] = valUtf8;
          }
        }
      } catch (e) {
        console.error('[Multipart Parse Error]', e.message);
      }
      next();
    });
  }

  return {
    single: () => parseMultipartRequest,
    array: () => parseMultipartRequest,
  };
}

const upload = createMultipartHandler(UPLOADS_DIR, IMAGE_ALLOWED_EXT);
const uploadFormFiles = createMultipartHandler(FORMS_UPLOAD_DIR, FORM_ALLOWED_EXT);

// Crear archivo demo de plantilla si no existe
const demoPdfPath = path.join(FORMS_UPLOAD_DIR, 'demo-croquis-bano.pdf');
if (!fs.existsSync(demoPdfPath)) {
  fs.writeFileSync(demoPdfPath, 'DimePrecio.es - Documento adjunto de solicitud de presupuesto.\n', 'utf8');
}

// ============================================================================
// MIDDLEWARE PRINCIPAL
// ============================================================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb', type: ['application/json', 'text/plain'] }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Sesión ligera basada en cookies firmadas + Identificador de visitante persistente (`sf_uid`)
const activeSessions = new Map();
app.use((req, res, next) => {
  let sid = req.cookies?.pp_sid;
  if (!sid || !activeSessions.has(sid)) {
    sid = uuidv4();
    activeSessions.set(sid, {});
    res.cookie('pp_sid', sid, { maxAge: 7 * 24 * 3600 * 1000, httpOnly: true, path: '/' });
  }
  if (!req.cookies?.sf_uid) {
    const newUid = `u-${uuidv4().slice(0, 12)}`;
    req.cookies.sf_uid = newUid;
    res.cookie('sf_uid', newUid, { maxAge: 180 * 24 * 3600 * 1000, path: '/', sameSite: 'lax' });
  }
  req.session = activeSessions.get(sid);
  req.session.destroy = () => {
    activeSessions.delete(sid);
    res.clearCookie('pp_sid');
  };
  next();
});

// Helper para registrar en Base de Datos (`pp_visitor_interests`) y Cookies lo que el cliente ha visto
async function trackUserSectorInterest(req, res, provinciaSlug, sectorSlug, postId = null) {
  if (!sectorSlug) return;
  const uid = req.cookies?.sf_uid || req.cookies?.pp_sid || 'anon';
  await recordSectorVisit(uid, provinciaSlug, sectorSlug, postId);

  const prevSeen = String(req.cookies?.pp_seen_sectors || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const updatedSeen = [sectorSlug, ...prevSeen.filter(s => s !== sectorSlug)].slice(0, 6);

  res.cookie('pp_last_sector', sectorSlug, { maxAge: 90 * 24 * 3600 * 1000, path: '/', sameSite: 'lax' });
  res.cookie('pp_seen_sectors', updatedSeen.join(','), { maxAge: 90 * 24 * 3600 * 1000, path: '/', sameSite: 'lax' });
}

// Detector automático de provincia (52 provincias de España)
app.use(geoDetectorMiddleware);

// Middleware de consentimiento de cookies (compatible con SocialsForce sf_consent = v1.aX.pX.mX)
app.use((req, res, next) => {
  const raw = req.cookies && req.cookies.sf_consent;
  const c = {
    set: typeof raw === 'string' && raw.startsWith('v1'),
    analytics: typeof raw === 'string' && /\.a1/.test(raw),
    personalization: typeof raw === 'string' && /\.p1/.test(raw),
    marketing: typeof raw === 'string' && /\.m1/.test(raw),
  };
  req.consent = c;
  res.locals.consent = c;
  res.locals.personalizationOn = c.personalization;
  next();
});

// Variables globales para todas las vistas EJS leídas desde la Base de Datos (`db.js`)
app.use(async (req, res, next) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY name');
    const [locations] = await pool.query('SELECT * FROM pp_locations');
    const [sectors] = await pool.query('SELECT * FROM pp_sectors');
    res.locals.categories = categories;
    res.locals.allLocations = locations && locations.length ? locations : rr.getLocations(false);
    res.locals.allSectors = sectors && sectors.length ? sectors : rr.getSectors(false);
    res.locals.admin = req.session.admin || null;
    res.locals.currentPath = req.path;
    res.locals.siteUrl = SITE_URL;
    res.locals.siteName = 'DimePrecio.es';
    res.locals.operatorPhone = process.env.OPERATOR_PHONE || '+34 622 15 87 03';
    res.locals.operatorPhoneRaw = (process.env.OPERATOR_PHONE || '+34622158703').replace(/\s+/g, '');
  } catch (e) {
    res.locals.categories = [];
    res.locals.allLocations = rr.getLocations(false);
    res.locals.allSectors = rr.getSectors(false);
    res.locals.admin = null;
    res.locals.currentPath = req.path;
    res.locals.siteUrl = SITE_URL;
    res.locals.siteName = 'DimePrecio.es';
    res.locals.operatorPhone = process.env.OPERATOR_PHONE || '+34 622 15 87 03';
    res.locals.operatorPhoneRaw = (process.env.OPERATOR_PHONE || '+34622158703').replace(/\s+/g, '');
  }
  next();
});

// ============================================================================
// REAL-TIME TRACKING CON SOCKET.IO (HEREDADO DE SOCIALSFORCE + AVISOS AGENTE)
// ============================================================================
const activeVisitors = new Map();

io.on('connection', socket => {
  const isAdmin = socket.handshake.auth?.role === 'admin';

  if (isAdmin) {
    socket.join('admins');
    socket.emit('visitors:snapshot', Array.from(activeVisitors.values()));
    return;
  }

  let visitorData = {
    socketId: socket.id,
    uid: socket.handshake.auth?.uid || uuidv4(),
    ip: socket.handshake.headers['x-forwarded-for']?.split(',')[0] || socket.handshake.address,
    userAgent: socket.handshake.headers['user-agent'] || '',
    currentPage: '/',
    pageTitle: 'DimePrecio.es',
    connectedAt: new Date().toISOString(),
    device: detectDevice(socket.handshake.headers['user-agent'] || ''),
    browser: detectBrowser(socket.handshake.headers['user-agent'] || ''),
    os: detectOS(socket.handshake.headers['user-agent'] || ''),
    country: 'ES',
    city: '',
    pagesVisited: 1,
    timeOnSite: 0,
  };

  activeVisitors.set(socket.id, visitorData);
  io.to('admins').emit('visitor:join', visitorData);
  io.to('admins').emit('visitors:count', activeVisitors.size);

  socket.on('page:view', async data => {
    const v = activeVisitors.get(socket.id);
    if (v) {
      v.currentPage = data.url || '/';
      v.pageTitle = data.title || '';
      v.pagesVisited++;
      activeVisitors.set(socket.id, v);
      io.to('admins').emit('visitor:navigate', v);
    }
  });

  socket.on('disconnect', () => {
    activeVisitors.delete(socket.id);
    io.to('admins').emit('visitor:leave', { socketId: socket.id });
    io.to('admins').emit('visitors:count', activeVisitors.size);
  });
});

function detectDevice(ua) {
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|iphone|android.*mobile/i.test(ua)) return 'mobile';
  return 'desktop';
}
function detectBrowser(ua) {
  if (/edg/i.test(ua)) return 'Edge';
  if (/chrome/i.test(ua)) return 'Chrome';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua)) return 'Safari';
  return 'Other';
}
function detectOS(ua) {
  if (/windows/i.test(ua)) return 'Windows';
  if (/mac/i.test(ua)) return 'macOS';
  if (/linux/i.test(ua)) return 'Linux';
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad/i.test(ua)) return 'iOS';
  return 'Other';
}

// ============================================================================
// RUTAS PÚBLICAS DE DimePrecio.ES (BASADAS EN SOCIALSFORCE + ALGORITMOS)
// ============================================================================

// PORTADA NACIONAL HIPER-PERSONALIZADA SEGÚN LA ZONA ELEGIDA Y LO YA VISTO POR EL CLIENTE
app.get('/', async (req, res) => {
  try {
    const userProv = req.detectedProvince || rr.getLocationBySlug('madrid');
    const visitorUid = req.cookies.sf_uid || req.cookies.pp_sid || null;

    // 1. Detectar sectores que el cliente ya ha visto (en BD `pp_visitor_interests`, cookies o sesión)
    const seenSectorSlugs = resolvePreferredSectors(visitorUid, req.cookies);
    const topSeenSectorSlug = req.query.sector_visto || seenSectorSlugs[0] || 'reformas-integrales';
    let preferredSector = null;
    let preferredSectorAd = null;
    let preferredSectorPosts = [];

    if (topSeenSectorSlug) {
      const [secRows] = await pool.query('SELECT * FROM pp_sectors WHERE slug = ?', [topSeenSectorSlug]);
      preferredSector = (secRows && secRows[0]) || rr.getSectorBySlug(topSeenSectorSlug);

      if (preferredSector) {
        // Anuncio recomendado de ese sector en la zona elegida (ej. anuncio de Aire Acondicionado en Madrid)
        const secAds = getRecommendedAds({
          provinciaSlug: userProv.slug,
          sectorSlug: preferredSector.slug,
          preferredSectors: seenSectorSlugs,
          limit: 2,
        });
        preferredSectorAd = secAds[0] || null;

        // Artículos de ese sector en la zona elegida desde la Base de Datos
        const [secPostsRows] = await pool.query(
          `SELECT p.* FROM posts p WHERE p.provincia_slug = ? AND p.sector_slug = ? AND p.status = 'published' ORDER BY p.views DESC LIMIT 6`,
          [userProv.slug, preferredSector.slug]
        );
        preferredSectorPosts = (secPostsRows || []).slice(0, 3).map(normalizePost);
      }
    }

    // 2. Algoritmo mejorado de SocialsForce: recomienda primero páginas de la zona elegida y de los sectores vistos
    const forYouPosts = await getForYou(visitorUid, 12, [], {
      provinciaSlug: userProv.slug,
      sectorSlug: preferredSector ? preferredSector.slug : null,
      clientCats: seenSectorSlugs,
      cookies: req.cookies,
    });
    const trending = await getTrending(6, [], {
      provinciaSlug: userProv.slug,
      sectorSlug: preferredSector ? preferredSector.slug : null,
    });

    // Artículos más recientes directamente desde MySQL
    const [latestRows] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM posts p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.status = 'published'
       ORDER BY p.published_at DESC LIMIT 14`
    );
    const latest = (latestRows && latestRows.length ? latestRows : forYouPosts).map(normalizePost);

    const featured = (forYouPosts.length ? forYouPosts : latest).slice(0, 3);
    const recommendedAds = getRecommendedAds({
      provinciaSlug: userProv.slug,
      sectorSlug: preferredSector ? preferredSector.slug : null,
      preferredSectors: seenSectorSlugs,
      limit: 6,
    });
    const homeExtras = await buildHomeExtrasData({
      provinciaSlug: userProv.slug,
      visitorUid,
      cookies: req.cookies,
    });

    res.render('home', {
      title: preferredSector
        ? `DimePrecio.es ${userProv.nombre} — Recomendaciones de ${preferredSector.nombre} y Guías en tu Zona`
        : `DimePrecio.es — Artículos, Guías y Soluciones en ${userProv.nombre}`,
      description: `Explora las secciones y artículos más relevantes en ${userProv.nombre} personalizados según tu zona e intereses en DimePrecio.es.`,
      canonicalUrl: `${SITE_URL}/`,
      featured,
      latest,
      trending,
      forYouPosts,
      recommendedAds,
      preferredSector,
      preferredSectorAd,
      preferredSectorPosts,
      homeExtras,
    });
  } catch (err) {
    console.error('[Home Error]', err);
    res.status(500).render('error', { title: 'Error', message: 'Error al cargar DimePrecio.es' });
  }
});

// PÁGINA GENERAL INTERACTIVA DE PEDIR PRESUPUESTO (/pedir-presupuesto) ACCESIBLE DESDE EL HEADER
app.get('/pedir-presupuesto', async (req, res) => {
  try {
    const visitorUid = req.cookies.sf_uid || req.cookies.pp_sid || null;
    const seenSectors = resolvePreferredSectors(visitorUid, req.cookies);

    const provSlugParam = String(req.query.provincia || '').trim();
    const zoneParam = String(req.query.zona || '').trim();
    const secSlugParam = String(req.query.sector || '').trim();
    const servicioPreseleccionado = String(req.query.servicio || '').trim();

    const [provRows] = provSlugParam
      ? await pool.query('SELECT * FROM pp_locations WHERE slug = ?', [provSlugParam])
      : [[]];
    const currentProvince = (provRows && provRows[0]) || rr.getLocationBySlug(provSlugParam) || req.detectedProvince || rr.getLocationBySlug('madrid');

    res.cookie('pp_prov', currentProvince.slug, { maxAge: 180 * 24 * 3600 * 1000, path: '/', sameSite: 'lax' });
    res.locals.detectedProvince = currentProvince;

    const effectiveSectorSlug = secSlugParam || seenSectors[0] || 'climatizacion-aire-acondicionado';
    const [secRows] = await pool.query('SELECT * FROM pp_sectors WHERE slug = ?', [effectiveSectorSlug]);
    const currentSector = (secRows && secRows[0]) || rr.getSectorBySlug(effectiveSectorSlug) || rr.getSectors()[0];

    if (secSlugParam) {
      await trackUserSectorInterest(req, res, currentProvince.slug, currentSector.slug);
    }

    // Leer formulario y calculadora de la Base de Datos (`pp_sector_forms`)
    const [formRows] = await pool.query('SELECT * FROM pp_sector_forms WHERE sector_slug = ?', [currentSector.slug, currentProvince.slug]);
    const customForm = (formRows && formRows[0]) || rr.getCustomForm(currentSector.slug, currentProvince.slug);

    const selectedZone = zoneParam || ((currentProvince.municipios && currentProvince.municipios[0]) || currentProvince.nombre);

    const [sectorPostsRows] = await pool.query(
      `SELECT p.* FROM posts p WHERE p.provincia_slug = ? AND p.sector_slug = ? AND p.status = 'published' ORDER BY p.views DESC LIMIT 6`,
      [currentProvince.slug, currentSector.slug]
    );
    const sectorPages = sectorPostsRows || [];

    const sidebarData = await buildSidebarData({
      provinciaSlug: currentProvince.slug,
      sectorSlug: currentSector.slug,
      visitorUid,
      cookies: req.cookies,
    });

    res.render('pedir-presupuesto', {
      title: `Pedir Presupuesto en ${currentProvince.nombre} (${selectedZone}) — ${currentSector.nombre} | DimePrecio.es`,
      description: `Selecciona tu provincia, zona en ${currentProvince.nombre} y servicio para utilizar la calculadora técnica y el formulario oficial de ${currentSector.nombre}.`,
      canonicalUrl: `${SITE_URL}/pedir-presupuesto`,
      currentProvince,
      currentSector,
      selectedZone,
      customForm,
      servicioPreseleccionado,
      sectorPages,
      sidebarData,
    });
  } catch (err) {
    console.error('[Pedir Presupuesto Error]', err);
    res.status(500).render('error', { title: 'Error', message: 'Error al cargar el navegador de presupuestos' });
  }
});

// VISTA SEPARADA DE LAS 52 PROVINCIAS Y DETECTOR DE ZONA (/provincias)
app.get('/provincias', async (req, res) => {
  const userProv = req.detectedProvince || rr.getLocationBySlug('madrid');
  const sidebarData = await buildSidebarData({
    provinciaSlug: userProv.slug,
    visitorUid: req.cookies.sf_uid,
    cookies: req.cookies,
  });
  res.render('provinces', {
    title: 'Seleccionar Provincia (52 Provincias de España) | DimePrecio.es',
    description: 'Detecta tu provincia por GPS, Código Postal o selecciona tu zona entre las 52 provincias de España para ver sus secciones y páginas relevantes.',
    canonicalUrl: `${SITE_URL}/provincias`,
    sidebarData,
  });
});

// VISTA SEPARADA DE SECCIONES / CATEGORÍAS EN LA PROVINCIA ACTIVA (/categories)
app.get('/categories', async (req, res) => {
  const userProv = req.detectedProvince || rr.getLocationBySlug('madrid');
  const allSectors = rr.getSectors(false);
  const [dbPosts] = await pool.query("SELECT * FROM posts WHERE status = 'published' ORDER BY views DESC");
  const sectorsWithPosts = allSectors.slice(0, 14).map(sec => {
    const pages = (dbPosts || []).filter(p => p.sector_slug === sec.slug && (!userProv || p.provincia_slug === userProv.slug || !p.provincia_slug));
    return {
      ...sec,
      posts: pages,
    };
  });
  const sidebarData = await buildSidebarData({
    provinciaSlug: userProv.slug,
    visitorUid: req.cookies.sf_uid,
    cookies: req.cookies,
  });
  res.render('categories', {
    title: `Secciones y Servicios en ${userProv.nombre} | DimePrecio.es`,
    description: `Explora todas las secciones de servicios profesionales en ${userProv.nombre} en DimePrecio.es.`,
    canonicalUrl: `${SITE_URL}/categories`,
    sectorsWithPosts,
    sidebarData,
  });
});

// PÁGINA DE PROVINCIA (/provincia/:provinciaSlug o /:provinciaSlug)
async function renderProvincePage(req, res, provinciaSlug) {
  const province = rr.getLocationBySlug(provinciaSlug);
  if (!province) return false;

  res.cookie('pp_prov', province.slug, { maxAge: 180 * 24 * 3600 * 1000, path: '/', sameSite: 'lax' });
  res.locals.detectedProvince = province;

  const visitorUid = req.cookies.sf_uid || null;
  const rankedPages = await getForYou(visitorUid, 12, [], {
    provinciaSlug: province.slug,
    cookies: req.cookies,
  });
  const provincePages = rankedPages;
  const provinceAds = rr.getRecommendedAds({ provinciaSlug: province.slug, limit: 6 });
  const sidebarData = await buildSidebarData({
    provinciaSlug: province.slug,
    visitorUid,
    cookies: req.cookies,
  });

  res.render('province', {
    title: `Zona ${province.nombre}: Secciones y Páginas Relevantes (2026) | DimePrecio.es`,
    description: `Entra en tu sección dentro de ${province.nombre} (${(province.municipios || []).join(', ')}) para consultar precios actualizados y pedir presupuesto.`,
    canonicalUrl: `${SITE_URL}/${province.slug}`,
    province,
    provinceAds,
    provincePages,
    sidebarData,
  });
  return true;
}

// PÁGINA DE PROVINCIA + SECCIÓN (/provincia/:provinciaSlug/:sectorSlug o /:provinciaSlug/:sectorSlug)
async function renderProvinceSectorPage(req, res, provinciaSlug, sectorSlug) {
  const [provRows] = await pool.query('SELECT * FROM pp_locations WHERE slug = ?', [provinciaSlug]);
  const [secRows] = await pool.query('SELECT * FROM pp_sectors WHERE slug = ?', [sectorSlug]);
  const province = (provRows && provRows[0]) || rr.getLocationBySlug(provinciaSlug);
  const sector = (secRows && secRows[0]) || rr.getSectorBySlug(sectorSlug);
  if (!province || !sector) return false;

  res.cookie('pp_prov', province.slug, { maxAge: 180 * 24 * 3600 * 1000, path: '/', sameSite: 'lax' });
  res.locals.detectedProvince = province;

  // Registrar en BD (`pp_visitor_interests`) y cookies que el cliente ha visto este sector en esta zona
  await trackUserSectorInterest(req, res, province.slug, sector.slug);

  const visitorUid = req.cookies.sf_uid || null;
  const zoneConfig = rr.getZoneConfig(province.slug, sector.slug);
  const sectorAds = rr.getRecommendedAds({ provinciaSlug: province.slug, sectorSlug: sector.slug, limit: 6 });
  const [formRows] = await pool.query('SELECT * FROM pp_sector_forms WHERE sector_slug = ?', [sector.slug, province.slug]);
  const customForm = (formRows && formRows[0]) || rr.getCustomForm(sector.slug, province.slug);
  const [sectorPostsRows] = await pool.query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug, c.color as category_color
     FROM posts p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.status = 'published' AND p.sector_slug = ? AND (p.provincia_slug = ? OR p.provincia_slug IS NULL)
     ORDER BY p.views DESC LIMIT 8`,
    [sector.slug, province.slug]
  );
  const sectorPages = (sectorPostsRows || []).map(normalizePost);
  const sidebarData = await buildSidebarData({
    provinciaSlug: province.slug,
    sectorSlug: sector.slug,
    visitorUid,
    cookies: req.cookies,
  });
  const seoInterlinks = rr.getSeoInterlinks({
    provinciaSlug: province.slug,
    sectorSlug: sector.slug,
  });

  res.render('province-sector', {
    title: `${sector.nombre} en ${province.nombre}: Artículos, Guías y Soluciones | DimePrecio.es`,
    description: `Artículos recomendados y soluciones de ${sector.nombre.toLowerCase()} en ${province.nombre} (${(province.municipios || []).slice(0, 4).join(', ')}). Rellena el formulario del sector al final de la página.`,
    canonicalUrl: `${SITE_URL}/${province.slug}/${sector.slug}`,
    province,
    sector,
    zoneConfig,
    sectorAds,
    customForm,
    sectorPages,
    sidebarData,
    seoInterlinks,
  });
  return true;
}

// VISTA DEDICADA Y ESPECÍFICA DE SOLICITUD DE PRESUPUESTO (/presupuesto/:provinciaSlug/:sectorSlug)
// Se accede después de haber entrado a la provincia y sección (ej. /madrid/reformas-integrales)
app.get('/presupuesto/:provinciaSlug/:sectorSlug', async (req, res, next) => {
  const province = rr.getLocationBySlug(req.params.provinciaSlug);
  const sector = rr.getSectorBySlug(req.params.sectorSlug);
  if (!province || !sector) return next();

  res.cookie('pp_prov', province.slug, { maxAge: 180 * 24 * 3600 * 1000, path: '/', sameSite: 'lax' });
  res.locals.detectedProvince = province;

  const customForm = rr.getCustomForm(sector.slug, province.slug);
  const servicioPreseleccionado = String(req.query.servicio || '').trim();
  const sidebarData = await buildSidebarData({
    provinciaSlug: province.slug,
    sectorSlug: sector.slug,
    visitorUid: req.cookies.sf_uid,
    cookies: req.cookies,
  });

  res.render('presupuesto', {
    title: `Solicitar Presupuesto de ${servicioPreseleccionado || sector.nombre} en ${province.nombre} | DimePrecio.es`,
    description: `Formulario oficial de presupuesto para ${servicioPreseleccionado || sector.nombre} en ${province.nombre}. Envía tu explicación y adjunta croquis o fotos al Agente de DimePrecio.es.`,
    canonicalUrl: `${SITE_URL}/presupuesto/${province.slug}/${sector.slug}`,
    province,
    sector,
    customForm,
    servicioPreseleccionado,
    sidebarData,
  });
});

app.get('/provincia/:provinciaSlug', async (req, res, next) => {
  const handled = await renderProvincePage(req, res, req.params.provinciaSlug);
  if (!handled) return next();
});

app.get('/provincia/:provinciaSlug/:sectorSlug', async (req, res, next) => {
  const handled = await renderProvinceSectorPage(req, res, req.params.provinciaSlug, req.params.sectorSlug);
  if (!handled) return next();
});

// PÁGINAS DE ARTÍCULOS Y GUÍAS CREADAS POR IA (/article/:slug y /guia/:slug)
async function handleArticleView(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug, c.color as category_color
       FROM posts p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.status = 'published'`,
      [req.params.slug]
    );

    if (!rows.length) {
      return res.status(404).render('error', { title: 'No encontrado', message: 'La página solicitada no existe en DimePrecio.es' });
    }

    const post = rows[0];
    await pool.query('UPDATE posts SET views = views + 1 WHERE id = ?', [post.id]);

    const currentProvince = rr.getLocationBySlug(post.provincia_slug) || req.detectedProvince || rr.getLocationBySlug('madrid');
    const currentSector = rr.getSectorBySlug(post.sector_slug) || rr.getSectors()[0];

    // Registrar en Base de Datos (`pp_visitor_interests`) y cookies el sector y zona del artículo leído
    await trackUserSectorInterest(req, res, currentProvince.slug, currentSector.slug, post.id);

    const [formRows] = await pool.query('SELECT * FROM pp_sector_forms WHERE sector_slug = ?', [currentSector.slug, currentProvince.slug]);
    const customForm = (formRows && formRows[0]) || rr.getCustomForm(currentSector.slug, currentProvince.slug);
    const recommendedAds = getRecommendedAds({
      provinciaSlug: currentProvince.slug,
      sectorSlug: currentSector.slug,
      limit: 4,
    });
    const related = await getRelated(post.id, post.category_id, 4, {
      provinciaSlug: currentProvince.slug,
      sectorSlug: currentSector.slug,
    });
    const sidebarData = await buildSidebarData({
      provinciaSlug: currentProvince.slug,
      sectorSlug: currentSector.slug,
      visitorUid: req.cookies.sf_uid,
      cookies: req.cookies,
      excludeIds: [post.id],
    });
    const seoInterlinks = rr.getSeoInterlinks({
      postId: post.id,
      provinciaSlug: currentProvince.slug,
      sectorSlug: currentSector.slug,
    });

    res.render('article', {
      title: post.meta_title || `${post.title} | DimePrecio.es`,
      description: post.meta_description || post.excerpt,
      canonicalUrl: `${SITE_URL}/article/${post.slug}`,
      ogImage: post.featured_image || post.image,
      pageType: 'article',
      post,
      currentProvince,
      currentSector,
      customForm,
      recommendedAds,
      related,
      sidebarData,
      seoInterlinks,
    });
  } catch (err) {
    console.error('[Article Error]', err);
    res.status(500).render('error', { title: 'Error', message: 'Error al cargar la página' });
  }
}

app.get('/article/:slug', handleArticleView);
app.get('/guia/:slug', handleArticleView);
app.get('/contenido/:slug', handleArticleView);

// CATEGORÍAS DE SOCIALSFORCE
app.get('/category/:slug', async (req, res) => {
  try {
    const userProv = req.detectedProvince || rr.getLocationBySlug('madrid');
    const sector = rr.getSectorBySlug(req.params.slug);
    if (sector) {
      return res.redirect(`/${userProv.slug}/${sector.slug}`);
    }
    const [cats] = await pool.query('SELECT * FROM categories WHERE slug = ?', [req.params.slug]);
    if (!cats.length) {
      return res.status(404).render('error', { title: 'No encontrado', message: 'Categoría no encontrada' });
    }
    const category = cats[0];
    const [posts] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug, c.color as category_color
       FROM posts p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.category_id = ? AND p.status = 'published'
       ORDER BY p.published_at DESC LIMIT 24`,
      [category.id]
    );
    const recommendedAds = getRecommendedAds({ provinciaSlug: userProv.slug, limit: 4 });
    const sidebarData = await buildSidebarData({
      provinciaSlug: userProv.slug,
      visitorUid: req.cookies.sf_uid,
      cookies: req.cookies,
    });
    res.render('for-you', {
      title: `${category.name} — Guías de Precios y Presupuestos | DimePrecio.es`,
      description: category.description,
      canonicalUrl: `${SITE_URL}/category/${category.slug}`,
      headingTitle: category.name,
      posts,
      recommendedAds,
      sidebarData,
    });
  } catch (err) {
    res.status(500).render('error', { title: 'Error', message: 'Error al cargar categoría' });
  }
});

// RECOMENDADOS PARA TI, TENDENCIAS Y RECIENTES
app.get('/for-you', async (req, res) => {
  const userProv = req.detectedProvince || rr.getLocationBySlug('madrid');
  const posts = await getForYou(req.cookies.sf_uid, 18, [], {
    provinciaSlug: userProv.slug,
    cookies: req.cookies,
  });
  const recommendedAds = getRecommendedAds({ provinciaSlug: userProv.slug, limit: 6 });
  const sidebarData = await buildSidebarData({
    provinciaSlug: userProv.slug,
    visitorUid: req.cookies.sf_uid,
    cookies: req.cookies,
  });
  res.render('for-you', {
    title: `Para Ti en ${userProv.nombre} | DimePrecio.es`,
    description: `Páginas de precios seleccionadas por el algoritmo de DimePrecio.es para ${userProv.nombre}.`,
    canonicalUrl: `${SITE_URL}/for-you`,
    posts,
    recommendedAds,
    sidebarData,
  });
});

app.get('/trending', async (req, res) => {
  const userProv = req.detectedProvince || rr.getLocationBySlug('madrid');
  const posts = await getTrending(18, [], { provinciaSlug: userProv.slug });
  const recommendedAds = getRecommendedAds({ provinciaSlug: userProv.slug, limit: 6 });
  const sidebarData = await buildSidebarData({
    provinciaSlug: userProv.slug,
    visitorUid: req.cookies.sf_uid,
    cookies: req.cookies,
  });
  res.render('trending', {
    title: `En Tendencia en ${userProv.nombre} | DimePrecio.es`,
    description: `Tendencias actuales de presupuestos y tarifas en ${userProv.nombre} y toda España.`,
    canonicalUrl: `${SITE_URL}/trending`,
    posts,
    recommendedAds,
    sidebarData,
  });
});

app.get('/recent', async (req, res) => {
  const userProv = req.detectedProvince || rr.getLocationBySlug('madrid');
  const [posts] = await pool.query(`
    SELECT p.*, c.name as category_name, c.slug as category_slug, c.color as category_color
    FROM posts p LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'published' ORDER BY p.published_at DESC LIMIT 24
  `);
  const recommendedAds = getRecommendedAds({ provinciaSlug: userProv.slug, limit: 6 });
  const sidebarData = await buildSidebarData({
    provinciaSlug: userProv.slug,
    visitorUid: req.cookies.sf_uid,
    cookies: req.cookies,
  });
  res.render('recent', {
    title: `Páginas Recientes | DimePrecio.es`,
    description: `Nuevas páginas de precios y presupuestos creadas por DimePrecio.es.`,
    canonicalUrl: `${SITE_URL}/recent`,
    posts,
    recommendedAds,
    sidebarData,
  });
});

// MOTOR DE BÚSQUEDA PERSONALIZADO (/search)
app.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const provParam = (req.query.provincia || '').trim();
    const secParam = (req.query.sector || '').trim();

    const activeProv = rr.getLocationBySlug(provParam) || req.detectedProvince || rr.getLocationBySlug('madrid');
    const searchData = rr.searchEverything({
      query: q,
      provinciaSlug: provParam || activeProv.slug,
      sectorSlug: secParam || null,
      limit: 24,
    });

    const currentProvince = searchData.detectedProvInQuery || activeProv;
    const currentSector = rr.getSectorBySlug(secParam) || searchData.matchedSectors[0] || rr.getSectors()[0];
    if (q && searchData.matchedSectors && searchData.matchedSectors[0]) {
      await trackUserSectorInterest(req, res, currentProvince.slug, searchData.matchedSectors[0].slug);
    }
    const sidebarData = await buildSidebarData({
      provinciaSlug: currentProvince.slug,
      sectorSlug: currentSector?.slug,
      visitorUid: req.cookies.sf_uid,
      cookies: req.cookies,
    });

    res.render('search', {
      title: q ? `Buscar "${q}" en ${currentProvince.nombre} — DimePrecio.es` : `Buscador de Servicios en ${currentProvince.nombre} — DimePrecio.es`,
      description: `Resultados personalizados de secciones y páginas para ${q || 'servicios profesionales'} en ${currentProvince.nombre}.`,
      canonicalUrl: `${SITE_URL}/search`,
      robots: 'noindex, follow',
      q,
      query: q,
      sectorFilter: secParam,
      provFilter: provParam,
      allLocations: rr.getLocations(false),
      allSectors: rr.getSectors(false),
      currentProvince,
      currentSector,
      isFallback: Boolean(searchData.isFallback),
      matchedSectors: searchData.matchedSectors,
      recommendedAds: searchData.recommendedAds,
      posts: searchData.matchedPages,
      results: searchData.matchedPages,
      totalResults: searchData.totalResults,
      sidebarData,
    });
  } catch (err) {
    console.error('[Search Error]', err);
    res.status(500).render('error', { title: 'Error', message: 'Error en la búsqueda' });
  }
});

// ============================================================================
// TELEMETRÍA Y ALGORITMO DE RECOMENDACIÓN DE SOCIALSFORCE (/api/track, /api/rec/*)
// ============================================================================
app.post('/api/track', (req, res) => {
  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    recordTrackEvent(payload);
  } catch (e) {}
  res.json({ ok: true });
});

app.post('/api/rec/impressions', (req, res) => {
  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    recordImpressions(payload);
  } catch (e) {}
  res.json({ ok: true });
});

app.post('/api/rec/click', (req, res) => {
  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    recordClick(payload);
  } catch (e) {}
  res.json({ ok: true });
});

app.get('/api/feed', async (req, res) => {
  const userProv = req.detectedProvince || rr.getLocationBySlug('madrid');
  const posts = await getForYou(req.cookies.sf_uid, 12, [], {
    provinciaSlug: userProv.slug,
    cookies: req.cookies,
  });
  res.json({ ok: true, posts });
});

// ============================================================================
// API DE AUTODETECCIÓN DE UBICACIÓN (GPS + CP INE + IP + MUNICIPIO) Y PRESUPUESTOS
// ============================================================================

// 1. Detectar o actualizar la provincia del usuario (IP / Cookie / CP 01-52 / Coordenadas GPS Haversine / Municipio)
app.get('/api/user/location', (req, res) => {
  const detected = detectLocationFromRequest(req);
  res.json({ ok: true, province: detected });
});

app.post('/api/user/location', (req, res) => {
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { provincia_slug, postal, cp, text, city, region, lat, lng } = body;
  let resolved = null;
  let source = 'manual';

  if (provincia_slug) {
    resolved = rr.getLocationBySlug(provincia_slug);
    source = 'slug';
  }
  if (!resolved && (postal || cp)) {
    resolved = matchProvinceByPostalCode(postal || cp);
    source = 'postal_code';
  }
  if (!resolved && (text || city || region)) {
    const combined = [postal, cp, city, region, text].filter(Boolean).join(' ');
    resolved = matchProvinceByPostalCode(combined) || matchProvinceByText(combined);
    source = 'text_or_ip';
  }
  if (!resolved && lat !== undefined && lng !== undefined) {
    resolved = resolveProvinceByCoordinates(lat, lng);
    source = 'gps_haversine';
  }
  if (!resolved) {
    return res.status(400).json({ ok: false, error: 'No se pudo determinar la provincia con los datos indicados' });
  }
  res.cookie('pp_prov', resolved.slug, { maxAge: 180 * 24 * 3600 * 1000, path: '/', sameSite: 'lax' });
  res.json({ ok: true, source, province: resolved });
});

// 2. Autocompletado instantáneo y personalizado del buscador (/api/search/suggest)
app.get('/api/search/suggest', (req, res) => {
  const q = String(req.query.q || '').trim();
  const provParam = String(req.query.provincia || '').trim();
  const secParam = String(req.query.sector || '').trim();
  const prov = (provParam && rr.getLocationBySlug(provParam)) || req.detectedProvince || rr.getLocationBySlug('madrid');
  const data = rr.searchEverything({
    query: q,
    provinciaSlug: prov.slug,
    sectorSlug: secParam || null,
    limit: 6,
  });

  res.json({
    ok: true,
    isFallback: Boolean(data.isFallback),
    detectedProvince: { slug: prov.slug, nombre: prov.nombre },
    activeSector: secParam ? rr.getSectorBySlug(secParam) : null,
    sectors: data.matchedSectors.slice(0, 5).map(s => ({
      slug: s.slug,
      nombre: s.nombre,
      icono: s.icono,
      precio_min: Math.round((s.formula_precio_base_json?.min || 100) * (prov.modificador_precio_regional || 1)),
    })),
    ads: data.recommendedAds.slice(0, 3).map(a => ({
      id: a.id,
      titulo: a.titulo,
      provincia_slug: a.provincia_slug,
      provincia_nombre: a.provincia_nombre,
      sector_slug: a.sector_slug,
      sello: a.sello,
    })),
    pages: data.matchedPages.slice(0, 5).map(p => ({
      slug: p.slug,
      title: p.title,
      provincia_nombre: p.provincia_nombre,
      sector_nombre: p.sector_nombre,
      image: p.featured_image || p.image,
    })),
  });
});

// 3. Obtener configuración dinámica de formulario de presupuesto por sector y provincia
app.get('/api/formularios/:sectorSlug', (req, res) => {
  const form = rr.getCustomForm(req.params.sectorSlug, req.query.provincia || null);
  res.json({ ok: true, form });
});

// 4. Recibir solicitud de presupuesto con explicación y archivos adjuntos
//    IMPORTANTE: La IA NO responde al usuario; se envía directamente al Agente en el panel de Admin
app.post('/api/presupuestos', uploadFormFiles.array('archivos_presupuesto', 5), (req, res) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    const createdQuote = rr.submitQuoteRequestToAgent(req.body || {}, files);

    // Emitir notificación en tiempo real al Agente en el panel /admin
    io.to('admins').emit('quote:new', { quote: createdQuote });

    res.json({
      ok: true,
      message: 'Tu formulario y explicación han sido enviados directamente al Agente de DimePrecio.es en tu provincia.',
      quote: {
        id: createdQuote.id,
        codigo: createdQuote.codigo,
        provincia_nombre: createdQuote.provincia_nombre,
        municipio: createdQuote.municipio,
        sector_nombre: createdQuote.sector_nombre,
        telefono_whatsapp: createdQuote.telefono_whatsapp,
      },
    });
  } catch (err) {
    console.error('[Submit Quote Error]', err);
    res.status(400).json({ ok: false, error: err.message || 'Error al registrar el presupuesto' });
  }
});

// 5. Página de Pago / Desbloqueo en 1 clic para el Modelo 1 ("Pago por Lead" Bizum / Stripe)
app.get('/pago-lead/:codigo', (req, res) => {
  const allQuotes = rr.getQuoteRequests();
  const quote = allQuotes.find(q => q.codigo === req.params.codigo);
  if (!quote) {
    return res.status(404).render('error', { title: 'No encontrado', message: 'Solicitud de contacto no encontrada' });
  }

  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Desbloquear Contacto Exclusivo ${quote.codigo} — DimePrecio.es</title>
  <link rel="stylesheet" href="/css/rankrent.css">
</head>
<body style="background:#0f172a;color:#f8fafc;font-family:system-ui,sans-serif;padding:30px 16px;">
  <div style="max-width:620px;margin:0 auto;background:#ffffff;color:#0f172a;border-radius:18px;padding:28px;box-shadow:0 20px 50px rgba(0,0,0,0.4);">
    <span style="background:#dbeafe;color:#1d4ed8;font-weight:800;font-size:12px;padding:4px 10px;border-radius:6px;">DimePrecio.ES · VENTA DIRECTA DE CONTACTO EXCLUSIVO</span>
    <h1 style="margin:12px 0 6px;font-size:24px;">Trabajo de ${quote.sector_nombre} en ${quote.municipio} (${quote.provincia_nombre})</h1>
    <p style="color:#475569;font-size:14.5px;line-height:1.5;">
      <strong>Explicación del vecino:</strong> "${quote.explicacion_cliente}"<br>
      <strong>Presupuesto estimado del trabajo:</strong> ${Number(quote.valor_estimado_trabajo).toLocaleString('es-ES')} €
    </p>
    ${quote.contacto_desbloqueado ? `
      <div style="background:#dcfce7;border:2px solid #22c55e;border-radius:12px;padding:18px;margin-top:16px;">
        <h3 style="margin:0 0 8px;color:#14532d;">✅ Contacto Desbloqueado en Exclusiva</h3>
        <p style="margin:0;font-size:15px;line-height:1.6;">
          <strong>Nombre del cliente:</strong> ${quote.nombre_cliente}<br>
          <strong>Teléfono / WhatsApp directo:</strong> <a href="tel:${quote.telefono_whatsapp}" style="color:#15803d;font-weight:800;">${quote.telefono_whatsapp}</a><br>
          <strong>Ubicación:</strong> ${quote.municipio} (${quote.provincia_nombre})
        </p>
      </div>
    ` : `
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:18px;margin:18px 0;">
        <div style="font-size:13px;color:#1e3a8a;font-weight:700;">Importe único por quedarte este contacto en exclusiva:</div>
        <div style="font-size:32px;font-weight:800;color:#1d4ed8;margin:6px 0;">${quote.precio_venta_lead} €</div>
        <div style="font-size:12.5px;color:#475569;">Pago inmediato por Bizum o Tarjeta (Stripe). En cuanto se confirma, se desbloquea aquí mismo el nombre y teléfono del vecino.</div>
      </div>
      <form method="POST" action="/pago-lead/${quote.codigo}/desbloquear">
        <button type="submit" style="width:100%;background:#16a34a;color:#fff;border:none;padding:14px;border-radius:10px;font-size:16px;font-weight:800;cursor:pointer;">
          💳 Confirmar Pago de ${quote.precio_venta_lead} € y Desbloquear Teléfono Ahora →
        </button>
      </form>
    `}
  </div>
</body>
</html>`);
});

app.post('/pago-lead/:codigo/desbloquear', (req, res) => {
  const allQuotes = rr.getQuoteRequests();
  const quote = allQuotes.find(q => q.codigo === req.params.codigo);
  if (quote) {
    rr.updateQuoteRequestAgent(quote.id, {
      contacto_desbloqueado: true,
      estado_agente: 'desbloqueado_pagado',
    });
  }
  res.redirect(`/pago-lead/${req.params.codigo}`);
});

// Interacción like heredada de socialsforce
app.post('/api/article/:id/like', async (req, res) => {
  await pool.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

// ============================================================================
// SITEMAP.XML, ROBOTS.TXT Y FEED RSS PARA DimePrecio.ES
// ============================================================================
function xmlEscape(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /pedir-presupuesto?\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

app.get('/sitemap.xml', async (req, res) => {
  try {
    const locations = rr.getLocations(true);
    const sectors = rr.getSectors(true);
    const [posts] = await pool.query(
      "SELECT title, slug, featured_image, image_alt, published_at, updated_at, provincia_slug, sector_slug FROM posts WHERE status = 'published' ORDER BY published_at DESC LIMIT 50000"
    );
    const today = new Date().toISOString().slice(0, 10);
    const baseUrl = (SITE_URL || 'https://dimeprecio.es').replace(/\/$/, '');

    // Fechas de última actualización por provincia y por combinación provincia x sector
    const latestDateByProvSec = new Map();
    const latestDateByProv = new Map();
    for (const p of posts || []) {
      const pDate = p.updated_at || p.published_at;
      if (!pDate) continue;
      const dStr = new Date(pDate).toISOString().slice(0, 10);
      if (p.provincia_slug && p.sector_slug) {
        const key = `${p.provincia_slug}__${p.sector_slug}`;
        if (!latestDateByProvSec.has(key) || latestDateByProvSec.get(key) < dStr) {
          latestDateByProvSec.set(key, dStr);
        }
      }
      if (p.provincia_slug) {
        if (!latestDateByProv.has(p.provincia_slug) || latestDateByProv.get(p.provincia_slug) < dStr) {
          latestDateByProv.set(p.provincia_slug, dStr);
        }
      }
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // 1. Portada y páginas hub principales
    xml += `  <url><loc>${baseUrl}/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/provincias</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/categories</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/pedir-presupuesto</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;

    // 2. Directorio de 52 provincias y 1.560 páginas [Provincia x Sector]
    for (const loc of locations) {
      const locMod = latestDateByProv.get(loc.slug) || '2026-01-15';
      xml += `  <url><loc>${baseUrl}/${loc.slug}</loc><lastmod>${locMod}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
      for (const sec of sectors) {
        const secMod = latestDateByProvSec.get(`${loc.slug}__${sec.slug}`) || locMod;
        xml += `  <url><loc>${baseUrl}/${loc.slug}/${sec.slug}</loc><lastmod>${secMod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
      }
    }

    // 3. Artículos editoriales y guías en BD (con extensión de imágenes para Google Images)
    for (const p of posts || []) {
      const lm = p.updated_at || p.published_at ? new Date(p.updated_at || p.published_at).toISOString().slice(0, 10) : today;
      let imgXml = '';
      if (p.featured_image) {
        const imgUrl = p.featured_image.startsWith('http') ? p.featured_image : `${baseUrl}${p.featured_image.startsWith('/') ? '' : '/'}${p.featured_image}`;
        imgXml = `<image:image><image:loc>${xmlEscape(imgUrl)}</image:loc><image:title>${xmlEscape(p.image_alt || p.title)}</image:title></image:image>`;
      }
      xml += `  <url><loc>${baseUrl}/article/${xmlEscape(p.slug)}</loc><lastmod>${lm}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority>${imgXml}</url>\n`;
    }

    // 4. Páginas legales y de transparencia
    xml += `  <url><loc>${baseUrl}/legal</loc><lastmod>2026-01-01</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/privacy</loc><lastmod>2026-01-01</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/cookies</loc><lastmod>2026-01-01</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>\n`;

    xml += `</urlset>`;

    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=14400',
    });
    res.send(xml);
  } catch (err) {
    console.error('[Sitemap Error]', err);
    res.status(500).type('text/plain').send('Error generating sitemap');
  }
});

app.get('/feed.xml', async (req, res) => {
  const [posts] = await pool.query("SELECT title, slug, excerpt, published_at FROM posts WHERE status = 'published' ORDER BY published_at DESC LIMIT 25");
  const items = (posts || [])
    .map(p => `<item><title><![CDATA[${p.title}]]></title><link>${SITE_URL}/article/${p.slug}</link><description><![CDATA[${p.excerpt || ''}]]></description></item>`)
    .join('');
  res.type('application/rss+xml').send(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>DimePrecio.es</title><link>${SITE_URL}</link><description>Guías de precios y presupuestos por provincias en España</description>${items}</channel></rss>`);
});

app.get('/privacy', (req, res) => res.render('error', { title: 'Política de Privacidad | DimePrecio.es', message: 'DimePrecio.es trata tus datos únicamente para gestionar las solicitudes de presupuesto en tu provincia conforme al RGPD.' }));
app.get('/cookies', (req, res) => res.render('error', { title: 'Política de Cookies | DimePrecio.es', message: 'Utilizamos cookies técnicas y de personalización para recordar tu provincia y recomendar las secciones de tu interés. Puedes configurarlas en cualquier momento desde el pie de página.' }));
app.get('/legal', (req, res) => res.render('error', { title: 'Aviso Legal | DimePrecio.es', message: 'DimePrecio.es — Portal informativo de guías sectoriales y central de solicitudes de presupuesto por provincias en España.' }));
app.post('/api/privacy/forget', (req, res) => {
  res.clearCookie('sf_vid');
  res.clearCookie('sf_uid');
  res.json({ ok: true });
});

// ============================================================================
// PANEL DE ADMINISTRACIÓN (/admin) — ANUNCIOS, ALGORITMO, 52×30, FORMULARIOS,
// BANDEJA DEL AGENTE Y CREADOR DE PÁGINAS CON IA (COMO SOCIALSFORCE)
// ============================================================================
function requireAdmin(req, res, next) {
  if (!req.session.admin) {
    // Auto-login SOLO en local (loopback). En cualquier otra IP hay que iniciar sesión.
    const ip = req.ip || req.socket.remoteAddress || '';
    const isLocal = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(ip);
    if (!isLocal) return res.redirect('/admin/login');
    req.session.admin = {
      id: 1,
      username: 'admin',
      displayName: 'Agente Central DimePrecio.es',
      role: 'admin',
    };
  }
  next();
}

// Descarga PRIVADA de archivos adjuntados por clientes (solo admin autenticado)
app.get('/admin/archivos/forms/:filename', requireAdmin, (req, res) => {
  const safeName = path.basename(req.params.filename);
  const fullPath = path.join(FORMS_UPLOAD_DIR, safeName);
  if (!fullPath.startsWith(FORMS_UPLOAD_DIR) || !fs.existsSync(fullPath)) {
    return res.status(404).send('Archivo no encontrado');
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, no-store');
  res.download(fullPath, safeName);
});

app.get('/admin/login', (req, res) => {
  if (req.session.admin) return res.redirect('/admin');
  res.render('admin/login', { title: 'Acceso Panel DimePrecio.es', error: null });
});

app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'Merchan1!';
  if (username === adminUser && password === adminPass) {
    req.session.admin = { id: 1, username: 'admin', displayName: 'Agente DimePrecio.es', role: 'admin' };
    return res.redirect('/admin');
  }
  res.render('admin/login', { title: 'Acceso Panel DimePrecio.es', error: 'Credenciales incorrectas' });
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// 1. DASHBOARD GENERAL DE DimePrecio.ES
app.get('/admin', requireAdmin, async (req, res) => {
  const [postsCountRows] = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN is_pinned=1 THEN 1 ELSE 0 END) as pinned, SUM(CASE WHEN is_selected=1 THEN 1 ELSE 0 END) as selected FROM posts');
  const [adsCountRows] = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN fijado=1 THEN 1 ELSE 0 END) as pinned, SUM(CASE WHEN seleccionado=1 THEN 1 ELSE 0 END) as selected FROM pp_ads');
  const [quotesCountRows] = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN estado_agente="nuevo_en_bandeja" THEN 1 ELSE 0 END) as new_inbox FROM pp_quote_requests');
  const [locationsRows] = await pool.query('SELECT COUNT(*) as total FROM pp_locations');
  const [sectorsRows] = await pool.query('SELECT COUNT(*) as total FROM pp_sectors');

  const baseOverview = rr.getAdminOverviewStats();
  const overview = {
    ...baseOverview,
    totalProvinces: locationsRows[0]?.total || 52,
    totalSectors: sectorsRows[0]?.total || 30,
    totalCombinations: (locationsRows[0]?.total || 52) * (sectorsRows[0]?.total || 30),
    totalPages: postsCountRows[0]?.total || 0,
    pinnedPages: postsCountRows[0]?.pinned || 0,
    selectedPages: postsCountRows[0]?.selected || 0,
    totalAds: adsCountRows[0]?.total || 0,
    pinnedAds: adsCountRows[0]?.pinned || 0,
    selectedAds: adsCountRows[0]?.selected || 0,
    totalQuotes: quotesCountRows[0]?.total || 0,
    newQuotesInInbox: quotesCountRows[0]?.new_inbox || 0,
  };

  const recentQuotes = rr.getQuoteRequests().slice(0, 8);
  const [recentPosts] = await pool.query(`
    SELECT p.*, c.name as category_name
    FROM posts p LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC LIMIT 10
  `);

  res.render('admin/dashboard', {
    title: 'Panel Central DimePrecio.es',
    overview,
    recentQuotes,
    recentPosts,
    onlineNow: activeVisitors.size,
  });
});

// 2. GESTIÓN DE ANUNCIOS ANÓNIMOS Y ALGORITMO DE RECOMENDACIÓN
app.get('/admin/anuncios', requireAdmin, async (req, res) => {
  const filters = {
    provincia_slug: req.query.provincia || '',
    sector_slug: req.query.sector || '',
    modelo_negocio: req.query.modelo || '',
    onlyActive: false,
  };
  const [adsFromDb] = await pool.query('SELECT * FROM pp_ads ORDER BY fijado DESC, prioridad DESC, id DESC');
  const ads = adsFromDb && adsFromDb.length ? adsFromDb : rr.getAds(filters);
  const overview = rr.getAdminOverviewStats();
  res.render('admin/anuncios', {
    title: 'Anuncios y Algoritmo — DimePrecio.es',
    ads,
    filters,
    algorithmConfig: overview.algorithmConfig,
  });
});

app.post('/admin/anuncios/guardar', requireAdmin, (req, res) => {
  rr.createOrUpdateAd(req.body || {});
  res.redirect('/admin/anuncios');
});

app.post('/admin/anuncios/:id/toggle', requireAdmin, (req, res) => {
  rr.toggleAdStatus(req.params.id, req.body.field || 'seleccionado');
  res.redirect('/admin/anuncios');
});

app.post('/admin/anuncios/:id/eliminar', requireAdmin, (req, res) => {
  rr.deleteAd(req.params.id);
  res.redirect('/admin/anuncios');
});

app.post('/admin/algoritmo/config', requireAdmin, (req, res) => {
  rr.updateAlgorithmConfig(req.body || {});
  res.redirect('/admin/anuncios');
});

// 3. GESTIÓN DE LA MATRIZ 52 PROVINCIAS × 30+ SECTORES
app.get('/admin/sectores-provincias', requireAdmin, (req, res) => {
  const zoneConfigs = rr.getAllZoneConfigs();
  res.render('admin/sectores-provincias', {
    title: '52 Provincias × Sectores — DimePrecio.es',
    zoneConfigs,
  });
});

app.post('/admin/zonas/guardar', requireAdmin, (req, res) => {
  rr.upsertZoneConfig(req.body || {});
  res.redirect('/admin/sectores-provincias');
});

app.post('/admin/sectores/nuevo', requireAdmin, (req, res) => {
  try {
    rr.addSector(req.body || {});
  } catch (e) {
    console.error('[Add Sector Error]', e.message);
  }
  res.redirect('/admin/sectores-provincias');
});

// 4. PERSONALIZADOR DE FORMULARIOS Y CALCULADORAS EN BASE DE DATOS
app.get('/admin/formularios', requireAdmin, async (req, res) => {
  const [sectors] = await pool.query('SELECT * FROM pp_sectors');
  const allSectors = sectors && sectors.length ? sectors : rr.getSectors(false);
  const selectedSector = rr.getSectorBySlug(req.query.sector) || allSectors[0];
  const [formRows] = await pool.query('SELECT * FROM pp_sector_forms WHERE sector_slug = ?', [selectedSector.slug, req.query.provincia || null]);
  const currentForm = (formRows && formRows[0]) || rr.getCustomForm(selectedSector.slug, req.query.provincia || null);
  res.render('admin/formularios', {
    title: 'Formularios y Calculadoras en Base de Datos — DimePrecio.es',
    selectedSector,
    currentForm,
  });
});

app.post('/admin/formularios/guardar', requireAdmin, async (req, res) => {
  const payload = { ...(req.body || {}) };
  await pool.query('UPDATE pp_sector_forms SET ? WHERE sector_slug = ?', [payload]);
  res.redirect(`/admin/formularios?sector=${encodeURIComponent(payload.sector_slug || '')}`);
});

// 5. BANDEJA DEL AGENTE (SOLICITUDES DE PRESUPUESTO + 4 MODELOS DE NEGOCIO)
app.get('/admin/presupuestos', requireAdmin, (req, res) => {
  const filters = {
    provincia_slug: req.query.provincia || '',
    sector_slug: req.query.sector || '',
    modelo_negocio: req.query.modelo || '',
  };
  const quotes = rr.getQuoteRequests(filters);
  res.render('admin/presupuestos', {
    title: 'Bandeja del Agente — DimePrecio.es',
    quotes,
    filters,
  });
});

app.post('/admin/presupuestos/:id/actualizar', requireAdmin, (req, res) => {
  rr.updateQuoteRequestAgent(req.params.id, req.body || {});
  res.redirect('/admin/presupuestos');
});

// ============================================================================
// CREADOR DE PÁGINAS CON IA Y PROGRAMADOR AUTOMÁTICO (HEREDADO DE SOCIALSFORCE)
// ============================================================================
app.get('/admin/live', requireAdmin, (req, res) => {
  res.render('admin/live', {
    title: 'Visitantes en Vivo — DimePrecio.es',
    visitors: Array.from(activeVisitors.values()),
  });
});

app.get('/admin/articles', requireAdmin, async (req, res) => {
  const [posts] = await pool.query(`
    SELECT p.*, c.name as category_name, c.color as category_color
    FROM posts p LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `);
  const articles = (posts || []).map(p => ({
    ...p,
    image: p.featured_image,
    category: p.sector_nombre ? `${p.provincia_nombre || 'España'} · ${p.sector_nombre}` : (p.category_name || 'DimePrecio.es'),
    indexed: true,
  }));
  res.render('admin/articles', { title: 'Páginas creadas por DimePrecio.es', posts: articles, articles });
});

app.get('/admin/create-article', requireAdmin, (req, res) => {
  res.render('admin/create-article', { title: 'Crear Página con IA — DimePrecio.es', post: null, error: null });
});

// Endpoint de generación de páginas con IA compatible con socialsforce (/createArticle y /api/ai/generate)
async function handleAiCreateArticle(req, res) {
  try {
    const promptText = req.body.prompt || req.body.topic || '';
    if (!promptText) return res.status(400).json({ success: false, error: 'El tema o prompt es obligatorio' });

    const article = await generateArticle(promptText, req.body.category || 'Presupuestos DimePrecio.es', 'profesional', 'es');
    const imageUrl = article.image_prompt ? await generateImage(article.image_prompt) : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80';

    res.json({
      ok: true,
      success: true,
      article,
      imageUrl,
      title: article.title,
      slug: rr.slugify(article.title),
      excerpt: article.excerpt,
      category: req.body.category || 'Reformas y Construcción',
      image: imageUrl,
      tags: (article.keywords || '').split(',').map(k => k.trim()).filter(Boolean),
      content: article.content,
    });
  } catch (err) {
    console.error('[AI Generate Error]', err);
    res.status(500).json({ success: false, error: 'Error generando página con IA: ' + err.message });
  }
}

app.post('/createArticle', requireAdmin, handleAiCreateArticle);
app.post('/api/ai/generate', requireAdmin, handleAiCreateArticle);

async function handleSaveAdminArticle(req, res) {
  try {
    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      category_id,
      image,
      ai_image_url,
      image_alt,
      status,
      is_featured,
      is_breaking,
      is_pinned,
      is_selected,
      priority_weight,
      provincia_slug,
      sector_slug,
      meta_title,
      meta_description,
      keywords,
      tags,
    } = req.body;
    const slug = customSlug ? rr.slugify(customSlug) : rr.slugify(title) + '-' + Date.now().toString(36);
    const featured_image = req.file ? `/uploads/${req.file.filename}` : (image || ai_image_url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80');

    const [ins] = await pool.query(
      `INSERT INTO posts (title, slug, excerpt, content, featured_image, image_alt, category_id, author_id, status, is_featured, is_breaking, meta_title, meta_description, keywords, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [title, slug, excerpt || '', content || '', featured_image, image_alt || title, category_id || 1, 1, status || 'published', is_featured ? 1 : 0, is_breaking ? 1 : 0, meta_title || title, meta_description || excerpt || '', keywords || tags || '']
    );

    if (ins && ins.insertId) {
      rr.updatePostAlgorithmSettings(ins.insertId, {
        is_pinned: is_pinned ? 1 : 0,
        is_selected: is_selected !== undefined ? (is_selected ? 1 : 0) : 1,
        priority_weight: priority_weight || 9,
        provincia_slug: provincia_slug || 'madrid',
        sector_slug: sector_slug || 'reformas-integrales',
      });
    }

    res.redirect('/admin/articles');
  } catch (err) {
    console.error('[Save Article Error]', err);
    res.render('admin/create-article', { title: 'Crear Página con IA', post: req.body, error: 'Error al guardar: ' + err.message });
  }
}

app.post('/admin/create-article', requireAdmin, upload.single('featured_image_file'), handleSaveAdminArticle);
app.post('/admin/articles/create', requireAdmin, upload.single('featured_image_file'), handleSaveAdminArticle);

app.post('/admin/articles/:id/toggle', requireAdmin, (req, res) => {
  rr.togglePostFlag(req.params.id, req.body.field || 'is_selected');
  res.redirect(req.get('referer') || '/admin/articles');
});

app.post('/admin/articles/:id/algorithm', requireAdmin, (req, res) => {
  rr.updatePostAlgorithmSettings(req.params.id, req.body || {});
  res.redirect(req.get('referer') || '/admin/articles');
});

app.post('/admin/articles/:id/delete', requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
  res.redirect('/admin/articles');
});

app.get('/admin/edit-article/:id', requireAdmin, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.redirect('/admin/articles');
  res.render('admin/create-article', { title: 'Editar Página — DimePrecio.es', post: rows[0], error: null });
});

app.post('/admin/edit-article/:id', requireAdmin, upload.single('featured_image_file'), async (req, res) => {
  const { title, excerpt, content, category_id, status, is_featured, is_breaking, meta_title, meta_description, keywords, existing_image, ai_image_url, image_alt } = req.body;
  const featured_image = req.file ? `/uploads/${req.file.filename}` : ai_image_url || existing_image || null;
  const slug = rr.slugify(title) + '-' + req.params.id;

  await pool.query(
    `UPDATE posts SET title=?, slug=?, excerpt=?, content=?, featured_image=?, image_alt=?, category_id=?, status=?, is_featured=?, is_breaking=?, meta_title=?, meta_description=?, keywords=? WHERE id=?`,
    [title, slug, excerpt, content, featured_image, image_alt || title, category_id || 1, status || 'published', is_featured ? 1 : 0, is_breaking ? 1 : 0, meta_title || title, meta_description || excerpt, keywords || '', req.params.id]
  );
  res.redirect('/admin/articles');
});

app.post('/admin/delete-article/:id', requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
  res.redirect('/admin/articles');
});

app.get('/admin/schedules', requireAdmin, async (req, res) => {
  const [schedules] = await pool.query('SELECT * FROM schedules ORDER BY created_at DESC');
  res.render('admin/schedules', { title: 'Programación Automática IA — DimePrecio.es', schedules });
});

app.post('/admin/schedules', requireAdmin, async (req, res) => {
  const { topic, category_id, frequency, cron_time, auto_publish } = req.body;
  const cronMap = {
    hourly: '0 * * * *',
    every_6h: '0 */6 * * *',
    daily: `0 ${(cron_time || '09:00').split(':')[0]} * * *`,
    weekly: `0 ${(cron_time || '09:00').split(':')[0]} * * 1`,
  };
  const cronExpr = cronMap[frequency] || '0 9 * * *';

  await pool.query(
    'INSERT INTO schedules (topic, category_id, frequency, cron_expr, auto_publish, is_active) VALUES (?, ?, ?, ?, ?, 1)',
    [topic, category_id || 1, frequency, cronExpr, auto_publish ? 1 : 0]
  );
  setupCronJobs();
  res.redirect('/admin/schedules');
});

app.post('/admin/schedules/:id/delete', requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM schedules WHERE id = ?', [req.params.id]);
  setupCronJobs();
  res.redirect('/admin/schedules');
});

app.post('/admin/schedules/:id/toggle', requireAdmin, async (req, res) => {
  await pool.query('UPDATE schedules SET is_active = NOT is_active WHERE id = ?', [req.params.id]);
  setupCronJobs();
  res.redirect('/admin/schedules');
});

app.get('/admin/categories', requireAdmin, async (req, res) => {
  const [cats] = await pool.query('SELECT * FROM categories ORDER BY name');
  res.render('admin/categories', { title: 'Categorías — DimePrecio.es', categories: cats });
});

// ============================================================================
// RUTAS DINÁMICAS DE ENLACE CORTO /:provinciaSlug y /:provinciaSlug/:sectorSlug
// ============================================================================
app.get('/:provinciaSlug', async (req, res, next) => {
  const handled = await renderProvincePage(req, res, req.params.provinciaSlug);
  if (!handled) return next();
});

app.get('/:provinciaSlug/:sectorSlug', async (req, res, next) => {
  const handled = await renderProvinceSectorPage(req, res, req.params.provinciaSlug, req.params.sectorSlug);
  if (!handled) return next();
});

// ============================================================================
// CRON JOBS PARA CREACIÓN AUTOMÁTICA DE PÁGINAS CON IA (COMO EN SOCIALSFORCE)
// ============================================================================
let activeCronJobs = [];

async function setupCronJobs() {
  activeCronJobs.forEach(j => clearInterval(j));
  activeCronJobs = [];
  try {
    const [schedules] = await pool.query('SELECT * FROM schedules WHERE is_active = 1');
    for (const sched of schedules) {
      const intervalMs = sched.frequency === 'hourly' ? 3600000 : sched.frequency === 'every_6h' ? 21600000 : 86400000;
      const timer = setInterval(async () => {
        try {
          const article = await generateArticle(sched.topic, 'Presupuestos DimePrecio.es');
          const imageUrl = article.image_prompt ? await generateImage(article.image_prompt) : null;
          const slug = rr.slugify(article.title) + '-' + Date.now().toString(36);
          const status = sched.auto_publish ? 'published' : 'draft';
          await pool.query(
            `INSERT INTO posts (title, slug, excerpt, content, featured_image, image_alt, category_id, author_id, status, meta_title, meta_description, keywords, published_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, NOW())`,
            [article.title, slug, article.excerpt, article.content, imageUrl, article.image_alt || article.title, sched.category_id, status, article.meta_title, article.meta_description, article.keywords]
          );
          await pool.query('UPDATE schedules SET last_run = NOW() WHERE id = ?', [sched.id]);
        } catch (err) {
          console.error('[Cron] Error:', err.message);
        }
      }, intervalMs);
      activeCronJobs.push(timer);
    }
  } catch (err) {}
}

// 404 Handler
app.use((req, res) => {
  res.status(404).render('error', { title: '404 — DimePrecio.es', message: 'La página que buscas no existe en DimePrecio.es' });
});

server.listen(PORT, async () => {
  console.log(`[DimePrecio.es] Servidor activo en http://localhost:${PORT}`);
  if (rr.syncFromDatabase) {
    await rr.syncFromDatabase().catch(err => console.error('[Sync DB Error]', err.message));
  }
  setupCronJobs();
});
