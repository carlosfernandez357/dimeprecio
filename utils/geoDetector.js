// ============================================================================
// DETECTOR INTELIGENTE DE ZONA Y PROVINCIA (PIDEPRECIO.ES)
// Combina 5 capas de detección precisa para las 52 provincias de España:
// 1. Código Postal Español (prefijos oficiales INE 01 a 52 -> 100% exacto)
// 2. Contexto de ruta (/madrid, /provincia/valencia, /presupuesto/sevilla/...)
// 3. Cookie persistente confirmada por el usuario o por auto-detección (pp_prov)
// 4. Diccionario de +500 municipios, ciudades y cabeceras GeoIP (CF/Vercel/ISP)
// 5. Cálculo geodésico Haversine por coordenadas GPS (lat, lng)
// ============================================================================

const { LOCATIONS_SEED } = require('./rankRentData');
const LOCATIONS = LOCATIONS_SEED || [];

function normalizeStr(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Mapa oficial INE de los 2 primeros dígitos del Código Postal en España -> slug de provincia
const POSTAL_PREFIX_TO_SLUG = {
  '01': 'alava',
  '02': 'albacete',
  '03': 'alicante',
  '04': 'almeria',
  '05': 'avila',
  '06': 'badajoz',
  '07': 'baleares',
  '08': 'barcelona',
  '09': 'burgos',
  '10': 'caceres',
  '11': 'cadiz',
  '12': 'castellon',
  '13': 'ciudad-real',
  '14': 'cordoba',
  '15': 'a-coruna',
  '16': 'cuenca',
  '17': 'girona',
  '18': 'granada',
  '19': 'guadalajara',
  '20': 'guipuzcoa',
  '21': 'huelva',
  '22': 'huesca',
  '23': 'jaen',
  '24': 'leon',
  '25': 'lleida',
  '26': 'la-rioja',
  '27': 'lugo',
  '28': 'madrid',
  '29': 'malaga',
  '30': 'murcia',
  '31': 'navarra',
  '32': 'ourense',
  '33': 'asturias',
  '34': 'palencia',
  '35': 'las-palmas',
  '36': 'pontevedra',
  '37': 'salamanca',
  '38': 'santa-cruz-de-tenerife',
  '39': 'cantabria',
  '40': 'segovia',
  '41': 'sevilla',
  '42': 'soria',
  '43': 'tarragona',
  '44': 'teruel',
  '45': 'toledo',
  '46': 'valencia',
  '47': 'valladolid',
  '48': 'vizcaya',
  '49': 'zamora',
  '50': 'zaragoza',
  '51': 'ceuta',
  '52': 'melilla',
};

function findLocBySlug(slug) {
  if (!slug) return null;
  const s = normalizeStr(slug).replace(/\s+/g, '-');
  return (
    LOCATIONS.find(l => l.slug === s) ||
    LOCATIONS.find(l => (s === 'la-coruna' && l.slug === 'a-coruna') || (s === 'a-coruna' && l.slug === 'la-coruna')) ||
    null
  );
}

const CITY_TO_PROVINCE = new Map();
LOCATIONS.forEach(loc => {
  CITY_TO_PROVINCE.set(loc.slug, loc);
  CITY_TO_PROVINCE.set(normalizeStr(loc.nombre), loc);
  (loc.municipios || []).forEach(mun => {
    CITY_TO_PROVINCE.set(normalizeStr(mun), loc);
  });
});

const EXTRA_ALIASES = {
  seville: 'sevilla',
  saragossa: 'zaragoza',
  biscay: 'vizcaya',
  bizkaia: 'vizcaya',
  bilbao: 'vizcaya',
  barakaldo: 'vizcaya',
  getxo: 'vizcaya',
  donostia: 'guipuzcoa',
  gipuzkoa: 'guipuzcoa',
  'san sebastian': 'guipuzcoa',
  irun: 'guipuzcoa',
  vitoria: 'alava',
  'vitoria-gasteiz': 'alava',
  araba: 'alava',
  corunna: 'a-coruna',
  'a coruna': 'a-coruna',
  'la coruna': 'a-coruna',
  santiago: 'a-coruna',
  'santiago de compostela': 'a-coruna',
  ferrol: 'a-coruna',
  majorca: 'baleares',
  palma: 'baleares',
  'palma de mallorca': 'baleares',
  mallorca: 'baleares',
  ibiza: 'baleares',
  menorca: 'baleares',
  tenerife: 'santa-cruz-de-tenerife',
  'la laguna': 'santa-cruz-de-tenerife',
  arona: 'santa-cruz-de-tenerife',
  'gran canaria': 'las-palmas',
  'las palmas de gran canaria': 'las-palmas',
  lanzarote: 'las-palmas',
  fuerteventura: 'las-palmas',
  oviedo: 'asturias',
  gijon: 'asturias',
  aviles: 'asturias',
  santander: 'cantabria',
  torrelavega: 'cantabria',
  pamplona: 'navarra',
  iruña: 'navarra',
  logrono: 'la-rioja',
  merida: 'badajoz',
  vigo: 'pontevedra',
  elche: 'alicante',
  elx: 'alicante',
  benidorm: 'alicante',
  torrevieja: 'alicante',
  alcoy: 'alicante',
  marbella: 'malaga',
  fuengirola: 'malaga',
  torremolinos: 'malaga',
  estepona: 'malaga',
  velez: 'malaga',
  cartagena: 'murcia',
  lorca: 'murcia',
  molina: 'murcia',
  jerez: 'cadiz',
  'jerez de la frontera': 'cadiz',
  algeciras: 'cadiz',
  'puerto de santa maria': 'cadiz',
  chiclana: 'cadiz',
  reus: 'tarragona',
  salou: 'tarragona',
  manresa: 'barcelona',
  sabadell: 'barcelona',
  terrassa: 'barcelona',
  badalona: 'barcelona',
  hospitalet: 'barcelona',
  mataro: 'barcelona',
  alcala: 'madrid',
  'alcala de henares': 'madrid',
  mostoles: 'madrid',
  alcorcon: 'madrid',
  leganes: 'madrid',
  getafe: 'madrid',
  fuenlabrada: 'madrid',
  alcendas: 'madrid',
  alcobendas: 'madrid',
  pozuelo: 'madrid',
  las_rozas: 'madrid',
  'las rozas': 'madrid',
  majadahonda: 'madrid',
  torrejon: 'madrid',
  parla: 'madrid',
  rivas: 'madrid',
  paterna: 'valencia',
  torrent: 'valencia',
  gandia: 'valencia',
  sagunto: 'valencia',
  alzira: 'valencia',
  mislata: 'valencia',
  'dos hermanas': 'sevilla',
  alcala_de_guadaira: 'sevilla',
  mairena: 'sevilla',
  utrera: 'sevilla',
  talavera: 'toledo',
  'talavera de la reina': 'toledo',
  ponferrada: 'leon',
};

function matchProvinceByPostalCode(postal) {
  const clean = String(postal || '').trim();
  const match = clean.match(/^(\d{2})\d{3}$/) || clean.match(/^(\d{2})$/);
  if (!match) return null;
  const prefix = match[1];
  const slug = POSTAL_PREFIX_TO_SLUG[prefix];
  return slug ? findLocBySlug(slug) : null;
}

function matchProvinceByText(text) {
  if (!text) return null;
  const raw = String(text).trim();

  // 1. Si es un código postal español (ej. 28013, 46004, 08001)
  const byPostal = matchProvinceByPostalCode(raw);
  if (byPostal) return byPostal;

  const clean = normalizeStr(raw);
  if (!clean) return null;

  // 2. Coincidencia directa en el mapa de provincias y municipios
  if (CITY_TO_PROVINCE.has(clean)) return CITY_TO_PROVINCE.get(clean);
  if (EXTRA_ALIASES[clean]) {
    return findLocBySlug(EXTRA_ALIASES[clean]);
  }

  // 3. Coincidencia por slug normalizado
  const slugCandidate = clean.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const bySlug = findLocBySlug(slugCandidate);
  if (bySlug) return bySlug;

  // 4. Búsqueda parcial en nombres de municipios y alias
  for (const [aliasKey, targetSlug] of Object.entries(EXTRA_ALIASES)) {
    if (aliasKey.length >= 4 && clean.includes(aliasKey)) {
      const found = findLocBySlug(targetSlug);
      if (found) return found;
    }
  }

  for (const [key, loc] of CITY_TO_PROVINCE.entries()) {
    if (key.length >= 4 && clean.includes(key)) return loc;
  }

  return null;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = d => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function resolveProvinceByCoordinates(lat, lng) {
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (!Number.isFinite(nLat) || !Number.isFinite(nLng)) return null;
  let best = null;
  let bestDist = Infinity;
  for (const loc of LOCATIONS) {
    const d = haversineKm(nLat, nLng, loc.lat, loc.lng);
    if (d < bestDist) {
      bestDist = d;
      best = loc;
    }
  }
  return best;
}

function detectLocationFromRequest(req) {
  let detected = null;
  let source = 'fallback';

  // 1. Parámetro explícito ?provincia= o ?prov= o ?cp=
  const qProv = req.query && (req.query.provincia || req.query.prov || req.query.cp || req.query.zona);
  if (qProv) {
    detected = matchProvinceByText(qProv);
    if (detected) source = 'query';
  }

  // 2. Contexto de ruta (/provincia/:slug, /presupuesto/:slug/:sector, o /:slug)
  if (!detected && req.path && req.path !== '/') {
    const segs = req.path.split('/').filter(Boolean);
    const candidate = (segs[0] === 'provincia' || segs[0] === 'presupuesto') ? segs[1] : segs[0];
    if (candidate) {
      detected = findLocBySlug(candidate);
      if (detected) source = 'url';
    }
  }

  // 3. Cookie persistente pp_prov
  if (!detected && req.cookies && req.cookies.pp_prov) {
    detected = findLocBySlug(req.cookies.pp_prov);
    if (detected) source = 'cookie';
  }

  // 4. Cabeceras GeoIP de CDN / Proxy (Cloudflare, Vercel, Nginx, Fastly)
  if (!detected && req.headers) {
    const postalHeader = req.headers['cf-postal-code'] || req.headers['x-vercel-ip-postal-code'];
    if (postalHeader) {
      detected = matchProvinceByPostalCode(postalHeader);
      if (detected) source = 'geoip-postal';
    }
    if (!detected) {
      const latHeader = req.headers['cf-iplatitude'] || req.headers['x-vercel-ip-latitude'];
      const lngHeader = req.headers['cf-iplongitude'] || req.headers['x-vercel-ip-longitude'];
      if (latHeader && lngHeader) {
        detected = resolveProvinceByCoordinates(latHeader, lngHeader);
        if (detected) source = 'geoip-coords';
      }
    }
    if (!detected) {
      const geoHeaders = [
        req.headers['cf-ipcity'],
        req.headers['x-vercel-ip-city'],
        req.headers['x-geo-city'],
        req.headers['cf-region'],
        req.headers['x-vercel-ip-country-region'],
      ].filter(Boolean);
      for (const h of geoHeaders) {
        detected = matchProvinceByText(decodeURIComponent(String(h)));
        if (detected) {
          source = 'geoip-city';
          break;
        }
      }
    }
  }

  // 5. Fallback inicial mientras el detector cliente (geo-detector.js) resuelve IP/GPS
  if (!detected) {
    detected = findLocBySlug('madrid') || LOCATIONS[0];
    source = 'fallback';
  }

  return { province: detected, source };
}

function geoDetectorMiddleware(req, res, next) {
  const { province, source } = detectLocationFromRequest(req);
  if (source === 'query' || source === 'url') {
    res.cookie('pp_prov', province.slug, { maxAge: 180 * 24 * 3600 * 1000, path: '/', sameSite: 'lax' });
  }
  req.detectedProvince = province;
  req.detectedProvinceSource = source;
  res.locals.detectedProvince = province;
  res.locals.userProvince = province;
  res.locals.userProvinceSource = source;
  next();
}

module.exports = {
  geoDetectorMiddleware,
  geoMiddleware: geoDetectorMiddleware,
  detectLocationFromRequest: req => detectLocationFromRequest(req).province,
  detectLocationWithSource: detectLocationFromRequest,
  resolveProvinceByCoordinates,
  findNearestProvinceByCoords: resolveProvinceByCoordinates,
  matchProvinceByText,
  matchProvinceByPostalCode,
};
