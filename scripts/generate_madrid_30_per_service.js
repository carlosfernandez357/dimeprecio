const pool = require('../db');
const rr = require('../utils/rankRentEngine');

const VERIFIED_PHOTOS = [
  'photo-1581578731548-c64695cc6952', 'photo-1584622650111-993a426fbf0a', 'photo-1621905251189-08b45d6a269e',
  'photo-1558002038-1055907df827', 'photo-1589939705384-5185137a7f0f', 'photo-1600585154340-be6161a56a0c',
  'photo-1585338107529-13afc5f02586', 'photo-1513694203232-719a280e022f', 'photo-1600518464441-9154a4dea21b',
  'photo-1503387762-592deb58ef4e', 'photo-1504307651254-35680f356dfd', 'photo-1505691938895-1758d7feb511',
  'photo-1512917774080-9991f1c4c750', 'photo-1560518883-ce09059eeffa', 'photo-1582268611958-ebfd161ef9cf',
  'photo-1595846519845-68e298c2edd8', 'photo-1585704032915-c3400ca199e7', 'photo-1621905252507-b35492cc74b4',
  'photo-1503708928676-1cb796a0891e', 'photo-1519003722824-194d4455a60c', 'photo-1562259949-e8e7689d7828',
  'photo-1632759145351-1d592919f522', 'photo-1574362848149-11496d93a7c7', 'photo-1581092160607-ee22621dd758',
  'photo-1581092580497-e0d23cbdf1dc', 'photo-1581094794329-c8112a89af12', 'photo-1507652313519-d4e9174996dd',
  'photo-1584622781564-1d987f7333c1', 'photo-1517581177682-a085bb7ffb15', 'photo-1521207418485-99c705420785',
  'photo-1507089947368-19c1da9775ae', 'photo-1600607687939-ce8a6c25118c', 'photo-1600566753190-17f0baa2a6c3',
  'photo-1600585154526-990dced4db0d', 'photo-1600573472591-ee6b68d14c68', 'photo-1600585152220-90363fe7e115'
];

const MADRID_VARIATIONS = [
  { slug: 'mostoles', name: 'Móstoles', type: 'local', desc: 'en el municipio de Móstoles y urbanizaciones cercanas' },
  { slug: 'alcala-de-henares', name: 'Alcalá de Henares', type: 'local', desc: 'en Alcalá de Henares y el Corredor del Henares' },
  { slug: 'fuenlabrada', name: 'Fuenlabrada', type: 'local', desc: 'en Fuenlabrada y polígonos industriales' },
  { slug: 'leganes', name: 'Leganés', type: 'local', desc: 'en Leganés centro, Zarzaquemada y La Fortuna' },
  { slug: 'getafe', name: 'Getafe', type: 'local', desc: 'en Getafe, Sector 3 y El Bercial' },
  { slug: 'alcorcon', name: 'Alcorcón', type: 'local', desc: 'en Alcorcón centro, Parque Lisboa y Ensanche Sur' },
  { slug: 'torrejon-de-ardoz', name: 'Torrejón de Ardoz', type: 'local', desc: 'en Torrejón de Ardoz y barrios residenciales' },
  { slug: 'parla', name: 'Parla', type: 'local', desc: 'en Parla y zona sur de la Comunidad de Madrid' },
  { slug: 'alcobendas', name: 'Alcobendas', type: 'local', desc: 'en Alcobendas, La Moraleja y polígonos' },
  { slug: 'las-rozas', name: 'Las Rozas de Madrid', type: 'local', desc: 'en Las Rozas, Europolis y zona Noroeste' },
  { slug: 'san-sebastian-de-los-reyes', name: 'San Sebastián de los Reyes', type: 'local', desc: 'en San Sebastián de los Reyes y Dehesa Vieja' },
  { slug: 'rivas-vaciamadrid', name: 'Rivas-Vaciamadrid', type: 'local', desc: 'en Rivas Futura, Rivas Pueblo y urbanizaciones' },
  { slug: 'pozuelo-de-alarcon', name: 'Pozuelo de Alarcón', type: 'local', desc: 'en Pozuelo de Alarcón, Somosaguas y Prado del Rey' },
  { slug: 'coslada', name: 'Coslada', type: 'local', desc: 'en Coslada y áreas logísticas del Este' },
  { slug: 'valdemoro', name: 'Valdemoro', type: 'local', desc: 'en Valdemoro y comarca de las Vegas' },
  { slug: 'majadahonda', name: 'Majadahonda', type: 'local', desc: 'en Majadahonda, Monte del Pilar y zona residencial' },
  { slug: 'collado-villalba', name: 'Collado Villalba', type: 'local', desc: 'en Collado Villalba y la Sierra de Guadarrama' },
  { slug: 'chamberi-salamanca', name: 'Chamberí y Salamanca', type: 'distrito', desc: 'en los distritos centrales de Chamberí, Salamanca y Retiro' },
  { slug: 'carabanchel-aluche', name: 'Carabanchel y Aluche', type: 'distrito', desc: 'en los distritos de Carabanchel, Latina y Aluche' },
  { slug: 'tetuan-chamartin', name: 'Tetuán y Chamartín', type: 'distrito', desc: 'en Tetuán, Plaza de Castilla y Chamartín' },
  { slug: 'tarifas-urgencias-24h', name: 'Tarifas y Urgencias 24h', type: 'especialidad', desc: 'servicios de urgencia 24 horas, nocturnos y festivos' },
  { slug: 'precios-por-hora', name: 'Precios por Hora y Desplazamiento', type: 'especialidad', desc: 'el desglose oficial de mano de obra por hora y suplementos' },
  { slug: 'comunidades-vecinos', name: 'Comunidades de Propietarios', type: 'especialidad', desc: 'mantenimiento y actuaciones en fincas y edificios comunitarios' },
  { slug: 'averias-frecuentes', name: 'Averías y Reparaciones Frecuentes', type: 'especialidad', desc: 'resolución de los fallos, incidencias y siniestros más comunes' },
  { slug: 'presupuesto-cerrado', name: 'Cómo Pedir Presupuesto Cerrado', type: 'especialidad', desc: 'cómo comparar presupuestos sin sorpresas ni costes ocultos' },
  { slug: 'normativa-y-licencias', name: 'Normativa, Permisos y Garantías', type: 'especialidad', desc: 'los permisos legales del Ayuntamiento de Madrid y garantías por ley' },
  { slug: 'ahorro-subvenciones', name: 'Ayudas y Deducciones Fiscales', type: 'especialidad', desc: 'ahorro, subvenciones públicas y desgravaciones en Madrid' },
  { slug: 'materiales-recomendados', name: 'Guía de Materiales y Marcas', type: 'especialidad', desc: 'análisis de calidades de materiales recomendados por técnicos' },
  { slug: 'mantenimiento-preventivo', name: 'Mantenimiento Preventivo', type: 'especialidad', desc: 'revisiones periódicas y consejos para alargar la vida útil' },
  { slug: 'comparador-tarifas', name: 'Comparador de Tarifas en Madrid', type: 'especialidad', desc: 'comparativa independiente de precios y empresas en Madrid' }
];

function generateHtml(sec, v, minPrice, maxPrice) {
  const isGeo = v.type === 'local' || v.type === 'distrito';
  const geoText = isGeo ? `en ${v.name} (Madrid)` : `en Madrid (${v.name})`;

  const tablaHtml = (sec.formula_precio_base_json?.tabla_precios || []).map(item => {
    const regMin = Math.round(item.min * 1.15);
    const regMax = Math.round(item.max * 1.15);
    return `
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:11px 14px;font-weight:600;color:#1e293b;">${item.servicio}</td>
      <td style="padding:11px 14px;color:#10b981;font-weight:700;">${regMin} € - ${regMax} €</td>
      <td style="padding:11px 14px;color:#64748b;font-size:13px;">${item.unidad || 'Presupuesto cerrado'}</td>
    </tr>`;
  }).join('');

  return `
<div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> El coste medio verificado para servicios de <strong>${sec.nombre} ${geoText}</strong> oscila entre <strong>${minPrice} € y ${maxPrice} €</strong> según los baremos actualizados a 2026 en el observatorio de DimePrecio.es. Los presupuestos se adaptan a las necesidades concretas ${v.desc}, con mano de obra cualificada y garantía reglamentaria por escrito.
  </p>
</div>

<h2>1. Tabla de tarifas orientativas de ${sec.nombre} ${geoText} (2026)</h2>
<p>
  A continuación te detallamos los precios medios más habituales que aplican los profesionales acreditados de <strong>DimePrecio.es</strong> para ${sec.nombre.toLowerCase()} ${v.desc}:
</p>

<table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14.5px;background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 14px;">Servicio Habitual</th>
      <th style="padding:12px 14px;">Coste Orientativo</th>
      <th style="padding:12px 14px;">Detalle</th>
    </tr>
  </thead>
  <tbody>
    ${tablaHtml}
  </tbody>
</table>

<h2>2. Aspectos clave de ${v.name} para contratar ${sec.nombre.toLowerCase()}</h2>
<p>
  Al solicitar presupuestos ${v.desc}, es importante tener en cuenta:
</p>
<ul style="line-height:1.7;color:#334155;padding-left:22px;">
  <li><strong>Tiempos de respuesta y desplazamientos:</strong> Los técnicos locales garantizan una llegada rápida sin sobrecostes desproporcionados por kilometraje.</li>
  <li><strong>Presupuestos por escrito:</strong> Exige siempre un desglose formal con IVA, materiales y plazo estimado antes de autorizar cualquier trabajo.</li>
  <li><strong>Garantía oficial DimePrecio:</strong> Todos los profesionales recomendados ofrecen garantía legal por escrito y seguro de responsabilidad civil.</li>
</ul>

<h2>3. Preguntas Frecuentes sobre ${sec.nombre} ${geoText}</h2>
<div style="margin:16px 0;">
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px;">
    <h3 style="margin:0 0 8px;font-size:15px;color:#0f172a;">¿Cuánto cuesta contratar ${sec.nombre.toLowerCase()} ${geoText}?</h3>
    <p style="margin:0;font-size:14px;color:#475569;line-height:1.55;">
      El rango habitual se sitúa entre <strong>${minPrice} € y ${maxPrice} €</strong> para los trabajos estándar auditados por DimePrecio.es.
    </p>
  </div>
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px;">
    <h3 style="margin:0 0 8px;font-size:15px;color:#0f172a;">¿Cómo contactar con un operador de DimePrecio.es para ${v.name}?</h3>
    <p style="margin:0;font-size:14px;color:#475569;line-height:1.55;">
      Llama al teléfono directo <strong><a href="tel:+34622158703" style="color:#0f172a;font-weight:700;">+34 622 15 87 03</a></strong> para recibir orientación y comparar presupuestos gratis en tu zona.
    </p>
  </div>
</div>

<div style="background:#0f172a;color:#ffffff;border-radius:10px;padding:22px;text-align:center;margin:28px 0;">
  <h3 style="margin:0 0 8px;font-size:17px;color:#ffffff;">¿Necesitas presupuesto para ${sec.nombre.toLowerCase()} ${geoText}?</h3>
  <p style="margin:0 0 16px;font-size:13.5px;color:#94a3b8;">
    Publica tu solicitud gratis o llama a un operador para recibir valoraciones de confianza en Madrid.
  </p>
  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
    <a href="/madrid/${sec.slug}#solicitar-presupuesto" style="background:#10b981;color:#ffffff;font-weight:700;padding:10px 18px;border-radius:6px;text-decoration:none;font-size:13.5px;">
      📋 Pedir Presupuesto en Madrid
    </a>
    <a href="tel:+34622158703" style="background:#ffffff;color:#0f172a;font-weight:700;padding:10px 18px;border-radius:6px;text-decoration:none;font-size:13.5px;">
      📞 Llamar al operador (+34 622 15 87 03)
    </a>
  </div>
</div>
  `.trim();
}

async function run() {
  console.log('[Madrid 30 Articles Generator] Iniciando...');

  const allSectors = rr.getSectors(false);
  // Servicios principales para Madrid
  const TARGET_SECTORS = [
    'cerrajeros-24h',
    'fontaneria-desatascos',
    'electricistas-boletines',
    'pintores-alisado-paredes',
    'reformas-integrales',
    'tejados-cubiertas',
    'climatizacion-aire-acondicionado',
    'carpinteria-aluminio-ventanas-pvc',
    'mudanzas-guardamuebles',
    'placas-solares-aerotermia'
  ];

  const selectedSectors = allSectors.filter(s => TARGET_SECTORS.includes(s.slug));
  console.log(`[Madrid Generator] Sectores a procesar: ${selectedSectors.length} (30 artículos por cada uno)`);

  const [existingSlugsRows] = await pool.query('SELECT slug FROM posts');
  const existingSlugs = new Set(existingSlugsRows.map(r => r.slug));

  let totalInserted = 0;
  let photoIndex = 0;

  for (const sec of selectedSectors) {
    console.log(`--> Generando 30 artículos para sector: ${sec.nombre} (${sec.slug})`);

    const baseMin = sec.formula_precio_base_json?.min_base || sec.formula_precio_base_json?.min || 100;
    const baseMax = sec.formula_precio_base_json?.max_base || sec.formula_precio_base_json?.max || 600;
    const minPrice = Math.round(baseMin * 1.15); // Factor regional Madrid
    const maxPrice = Math.round(baseMax * 1.15);

    for (const v of MADRID_VARIATIONS) {
      let slug = `${sec.slug}-${v.slug}-madrid-2026`;
      if (existingSlugs.has(slug)) {
        slug = `precios-${sec.slug}-${v.slug}-madrid`;
      }
      if (existingSlugs.has(slug)) {
        continue; // ya existe
      }
      existingSlugs.add(slug);

      const isGeo = v.type === 'local' || v.type === 'distrito';
      const title = isGeo
        ? `${sec.nombre} en ${v.name} (Madrid): Precios y Presupuestos (2026)`
        : `${sec.nombre} en Madrid: ${v.name} (Tarifas 2026)`;

      const excerpt = isGeo
        ? `¿Cuánto cuesta contratar ${sec.nombre.toLowerCase()} en ${v.name} (Madrid)? Precios medios 2026, tarifas y presupuestos verificados en DimePrecio.es.`
        : `Guía oficial sobre ${v.name.toLowerCase()} para ${sec.nombre.toLowerCase()} en Madrid. Baremos y tarifas 2026 en DimePrecio.es.`;

      const metaTitle = isGeo
        ? `${sec.nombre} en ${v.name} Madrid Precios 2026 | DimePrecio.es`
        : `${sec.nombre} en Madrid ${v.name} 2026 | DimePrecio.es`;

      const metaDesc = `Consulta precios de ${sec.nombre.toLowerCase()} en ${v.name} (Comunidad de Madrid). Baremos actualizados 2026 y presupuestos gratuitos en DimePrecio.es.`;
      const keywords = `${sec.slug.replace(/-/g, ' ')} ${v.slug} madrid, precios ${sec.slug.replace(/-/g, ' ')} madrid, presupuesto ${sec.slug.replace(/-/g, ' ')} ${v.name}`;

      // Asignar imagen verificada distinta de la lista
      const photoId = VERIFIED_PHOTOS[photoIndex % VERIFIED_PHOTOS.length];
      photoIndex++;
      const featuredImage = `https://images.unsplash.com/${photoId}?w=900&q=80`;

      const content = generateHtml(sec, v, minPrice, maxPrice);

      const sql = `
        INSERT INTO posts (
          title, slug, excerpt, content, featured_image, image_alt,
          category_id, author_id, status, is_featured, is_breaking, is_selected, is_pinned,
          priority_weight, meta_title, meta_description, keywords,
          provincia_id, provincia_slug, provincia_nombre,
          sector_id, sector_slug, sector_nombre, sector_icono,
          municipio_tag, precio_min_orientativo, precio_max_orientativo,
          views, likes, published_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          1, 1, 'published', 0, 0, 1, 0,
          7, ?, ?, ?,
          1, 'madrid', 'Madrid',
          ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, NOW()
        )
      `;

      const views = Math.floor(Math.random() * 80) + 20;
      const likes = Math.floor(Math.random() * 6) + 1;

      await pool.query(sql, [
        title, slug, excerpt, content, featuredImage, `${sec.nombre} en ${v.name} Madrid`,
        metaTitle, metaDesc, keywords,
        sec.id || null, sec.slug, sec.nombre, sec.icono || '🛠️',
        v.name, minPrice, maxPrice,
        views, likes
      ]);

      totalInserted++;
    }
  }

  console.log(`[Madrid Generator] ¡Completado con éxito!`);
  console.log(`[Madrid Generator] Total artículos insertados en MySQL para Madrid: ${totalInserted}`);

  const [countMadrid] = await pool.query("SELECT count(*) as total FROM posts WHERE provincia_slug = 'madrid'");
  console.log(`[Madrid Generator] Total artículos de Madrid en la base de datos ahora: ${countMadrid[0].total}`);

  if (rr.syncFromDatabase) {
    await rr.syncFromDatabase();
  }

  process.exit(0);
}

run().catch(err => {
  console.error('[Madrid Generator Error]', err);
  process.exit(1);
});
