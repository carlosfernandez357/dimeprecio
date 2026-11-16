const https = require('https');
const pool = require('../db');

// Catálogo de imágenes de Unsplash verificadas (HTTP 200) por sector
const SECTOR_VERIFIED_IMAGES = {
  'fontaneria-desatascos': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=900&q=80',
  'reformas-integrales': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80',
  'climatizacion-aire-acondicionado': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&q=80',
  'electricistas-boletines': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900&q=80',
  'cerrajeros-24h': 'https://images.unsplash.com/photo-1558002038-1055907df823?w=900&q=80',
  'pintores-alisado-paredes': 'https://images.unsplash.com/photo-1562259949-e8e7689d7823?w=900&q=80',
  'tejados-cubiertas': 'https://images.unsplash.com/photo-1632759145351-1d5929117a78?w=900&q=80',
  'carpinteria-aluminio-ventanas-pvc': 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=900&q=80',
  'mudanzas-guardamuebles': 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=900&q=80',
  'placas-solares-aerotermia': 'https://images.unsplash.com/photo-1613665813446-82a78c49b6ff?w=900&q=80',
  'aislamiento-termico-humedades': 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=900&q=80',
  'instalacion-suelos-parquet': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&q=80',
  'empresas-limpieza-cristales': 'https://images.unsplash.com/photo-1527515637462-cff94eecc5a6?w=900&q=80',
  'control-plagas-desinfeccion': 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=900&q=80',
  'jardineria-piscinas': 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=900&q=80',
  'puertas-automaticas-garajes': 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=900&q=80',
  'reformas-locales-naves': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80',
  'arquitectos-licencias': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&q=80',
  'abogados-especialistas': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&q=80',
  'asesorias-gestorias': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80',
  'clinicas-dentales-implantes': 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=900&q=80',
  'fisioterapia-rehabilitacion': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=80',
  'clinicas-estetica-injerto-capilar': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&q=80',
  'psicologos-terapia': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&q=80',
  'talleres-mecanicos-chapa-pintura': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=900&q=80',
  'cuidado-mayores-domicilio': 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=900&q=80',
  'entrenadores-personales-nutricionistas': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80',
  'fotografia-video-eventos': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&q=80',
  'diseno-web-digitalizacion': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80',
  'inmobiliarias-tasacion-viviendas': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80'
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80';

// Consulta el endpoint en vivo de sugerencias de Google España
function queryGoogleSuggest(term) {
  return new Promise((resolve) => {
    const url = `https://suggestqueries.google.com/complete/search?client=chrome&hl=es&gl=es&q=${encodeURIComponent(term)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json[1] || []);
        } catch {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

// Obtiene sugerencias agrupadas por intención de búsqueda
async function getGoogleSuggestions(term, location = 'madrid', { deep = false, max = 20 } = {}) {
  const cleanTerm = (term || '').trim();
  const cleanLoc = (location || '').trim();
  const base = cleanLoc ? `${cleanTerm} ${cleanLoc}` : cleanTerm;

  const patterns = [
    `cuanto cuesta ${base}`,
    `precio ${base}`,
    `${base} precios`,
    `tarifas ${base}`,
    `mejor ${base}`,
    base
  ];

  if (deep) {
    const letters = ['a', 'b', 'c', 'd', 'e', 'm', 'p', 'u'];
    letters.forEach(l => patterns.push(`${base} ${l}`));
  }

  const seen = new Set();
  const all = [];

  for (const pat of patterns) {
    const list = await queryGoogleSuggest(pat);
    for (const item of list) {
      const lower = item.toLowerCase().trim();
      if (!seen.has(lower)) {
        seen.add(lower);
        all.push(item);
      }
    }
    if (all.length >= max * 2) break;
  }

  const priceQueries = all.filter(s => {
    const l = s.toLowerCase();
    return l.includes('precio') || l.includes('cuesta') || l.includes('cuanto') || l.includes('tarifa') || l.includes('m2') || l.includes('barato');
  });

  const questions = all.filter(s => {
    const l = s.toLowerCase();
    return l.startsWith('cuanto') || l.startsWith('como') || l.startsWith('que ') || l.startsWith('donde') || l.includes('?');
  });

  return {
    query: base,
    total: all.length,
    suggestions: all.slice(0, max),
    priceQueries: priceQueries.slice(0, 10),
    questions: questions.slice(0, 10)
  };
}

// Convierte un texto en un slug SEO limpio
function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Analiza tendencias y encuentra una búsqueda que aún no tenga artículo en la base de datos
async function getTrendingTopicForSchedule({ sectorSlug = 'reformas-integrales', provinciaSlug = 'madrid', fallbackTopic = '' } = {}) {
  const querySeed = fallbackTopic || sectorSlug.replace(/-/g, ' ');
  const res = await getGoogleSuggestions(querySeed, provinciaSlug, { deep: true, max: 25 });

  // Lista de candidatos ordenada: primero preguntas de precio, luego el resto
  const candidates = [...res.priceQueries, ...res.questions, ...res.suggestions];

  if (candidates.length === 0) {
    candidates.push(`precio ${querySeed} ${provinciaSlug} 2026`);
  }

  // Comprobar contra la BD qué slug ya existe
  let chosenQuery = candidates[0];
  for (const candidate of candidates) {
    const candidateSlug = slugify(candidate);
    const [existing] = await pool.query(
      'SELECT id FROM posts WHERE slug = ? OR slug LIKE ? LIMIT 1',
      [candidateSlug, `%${candidateSlug.slice(0, 30)}%`]
    );
    if (!existing || existing.length === 0) {
      chosenQuery = candidate;
      break;
    }
  }

  return {
    chosenQuery,
    provinciaSlug,
    sectorSlug,
    allTrends: res.suggestions.slice(0, 8),
    priceQueries: res.priceQueries.slice(0, 5)
  };
}

// Construye un artículo completo con estructura SEO/AEO artesanal optimizado para la tendencia detectada
function buildArtisanArticleForTrend({ trendQuery, sectorSlug = 'reformas-integrales', provinciaSlug = 'madrid', sectorNombre = 'Servicios', provinciaNombre = 'Madrid' }) {
  const capQuery = trendQuery.charAt(0).toUpperCase() + trendQuery.slice(1);
  const title = `${capQuery}: Precios y Guía Completa en ${provinciaNombre} (2026)`;
  const slug = slugify(`${trendQuery}-${provinciaSlug}-2026`);
  const image = SECTOR_VERIFIED_IMAGES[sectorSlug] || DEFAULT_IMAGE;

  const content = `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> Al buscar <em>"${trendQuery}"</em> en <strong>${provinciaNombre}</strong>, los presupuestos medios de profesionales verificados oscilan entre tarifas estándar y servicios de urgencia según la magnitud del trabajo y las características del inmueble. En DimePrecio.es auditamos precios oficiales de mano de obra y materiales para garantizar presupuestos transparentes sin sobrecostes ocultos en la Comunidad de ${provinciaNombre}.
  </p>
</div>

<h2>1. Tarifas y baremos orientativos en ${provinciaNombre} (2026)</h2>
<p>
  A continuación se muestra el desglose de tarifas medias contratadas habitualmente en ${provinciaNombre} para la búsqueda <strong>${trendQuery}</strong>:
</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Concepto / Intervención</th>
      <th style="padding:12px 14px;">Coste Orientativo ${provinciaNombre}</th>
      <th style="padding:12px 14px;">Detalle del Servicio</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Servicio estándar programado</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">Tarifa ajustada de mercado</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Diagnóstico, mano de obra especializada y garantía legal</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Intervención completa o integral</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">Presupuesto a medida</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Materiales de calidad certificada y ejecución llave en mano</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:12px 14px;font-weight:600;color:#1e293b;">Servicio urgente o festivo</td>
      <td style="padding:12px 14px;color:#10b981;font-weight:700;">Suplemento 24 horas</td>
      <td style="padding:12px 14px;color:#64748b;font-size:13px;">Atención rápida en menos de 45 minutos en ${provinciaNombre}</td>
    </tr>
  </tbody>
</table>

<h2>2. Qué tener en cuenta antes de contratar en ${provinciaNombre}</h2>
<p>
  Para evitar presupuestos inflados o trabajos sin cobertura, asegúrate de exigir factura oficial con desglose de IVA y comprobar que los operarios cuenten con seguro de responsabilidad civil vigente. En DimePrecio.es conectamos únicamente con autónomos y empresas auditadas.
</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:28px 0;text-align:center;">
  <h3 style="margin-top:0;color:#166534;font-size:18px;">¿Necesitas asesoramiento o presupuesto cerrado en ${provinciaNombre}?</h3>
  <p style="color:#15803d;margin-bottom:15px;font-size:14px;">Contacta gratis con operadores especializados de DimePrecio.es para profesionales de ${sectorNombre} en ${provinciaNombre}.</p>
  <a href="tel:+34622158703" style="display:inline-block;background:#15803d;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:700;text-decoration:none;font-size:15px;">📞 Llamar a un operador (+34 622 15 87 03)</a>
</div>
  `.trim();

  return {
    title,
    slug,
    excerpt: `¿Cuánto cuesta ${trendQuery} en ${provinciaNombre}? Consulta tarifas medias, comparativa de presupuestos y precios oficiales 2026 en DimePrecio.es.`,
    content,
    featured_image: image,
    image_alt: `${capQuery} en ${provinciaNombre}`,
    category_id: 1,
    meta_title: `${capQuery} en ${provinciaNombre} Precios 2026 | DimePrecio.es`,
    meta_description: `Guía oficial sobre ${trendQuery} en ${provinciaNombre}: tarifas reales, comparativas y asesoramiento telefónico gratuito en DimePrecio.es.`,
    keywords: `${trendQuery}, precios ${provinciaNombre}, tarifas ${sectorNombre.toLowerCase()} ${provinciaNombre}, cuanto cuesta en ${provinciaNombre}`,
    provincia_slug: provinciaSlug,
    provincia_nombre: provinciaNombre,
    sector_slug: sectorSlug,
    sector_nombre: sectorNombre,
    priority_weight: 9,
    is_selected: 1,
    is_pinned: 0
  };
}

module.exports = {
  getGoogleSuggestions,
  getTrendingTopicForSchedule,
  buildArtisanArticleForTrend,
  SECTOR_VERIFIED_IMAGES,
  slugify
};
