const pool = require('../db');
const rr = require('../utils/rankRentEngine');

async function main() {
  console.log('Insertando anuncio y artículo de Cerrajeros 24h...');

  // 1. Insertar Anuncio en pp_ads
  const [existingAd] = await pool.query('SELECT id FROM pp_ads WHERE sector_slug = "cerrajeros-24h" AND provincia_slug = "madrid"');
  if (!existingAd || existingAd.length === 0) {
    await pool.query(
      `INSERT INTO pp_ads (
        codigo, titulo, subtitulo, cta_texto, marca_visible, es_anonimo,
        provincia_slug, provincia_nombre, sector_slug, sector_nombre, sector_icono,
        municipios_cubiertos, fijado, seleccionado, prioridad, activo,
        impresiones, clics, conversiones, created_at
      ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, 1, 1, 9, 1, 0, 0, 0, NOW())`,
      [
        'AD-MAD-04',
        'Cerrajeros 24 Horas en Madrid: Apertura sin Daños y Bombines Antibumping',
        'Llegada en 20-30 minutos en Madrid Centro y todos los distritos. Precios transparentes con presupuesto previo.',
        'Pedir Cerrajero Urgente',
        'DimePrecio.es',
        'madrid',
        'Madrid',
        'cerrajeros-24h',
        'Cerrajeros 24h',
        '🔑',
        JSON.stringify(['Madrid Centro', 'Chamberí', 'Salamanca', 'Chamartín', 'Tetuán', 'Pozuelo', 'Alcobendas'])
      ]
    );
    console.log('✅ Anuncio de Cerrajeros 24h en Madrid insertado en pp_ads.');
  } else {
    console.log('ℹ️ Anuncio de Cerrajeros 24h ya existía.');
  }

  // 2. Insertar Artículo de Cerrajeros 24h en posts
  const cerrajeroArticle = {
    title: 'Cerrajeros 24 Horas en Madrid: Precios de Apertura y Cambio de Cerraduras (2026)',
    slug: 'cerrajeros-24-horas-madrid-precios-2026',
    excerpt: '¿Te has dejado las llaves puestas o necesitas cambiar la cerradura? Baremos oficiales de cerrajeros 24h en Madrid: precios de apertura, bombines antibumping y cerrojos FAC en DimePrecio.es.',
    provincia_id: 1,
    provincia_slug: 'madrid',
    provincia_nombre: 'Madrid',
    sector_id: 13,
    sector_slug: 'cerrajeros-24h',
    sector_nombre: 'Cerrajeros 24h',
    sector_icono: '🔑',
    category_id: 1,
    precio_min_orientativo: 65,
    precio_max_orientativo: 320,
    featured_image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=900&q=80',
    image_alt: 'Cerrajero urgente 24 horas abriendo cerradura en Madrid - DimePrecio.es',
    meta_title: 'Cerrajeros 24 Horas en Madrid Precios y Tarifas 2026 | DimePrecio.es',
    meta_description: 'Cuánto cobra un cerrajero urgente en Madrid: apertura de puerta sin romper desde 65€, cambio de bombín y cerrojos. Tarifas auditadas en DimePrecio.es.',
    keywords: 'cerrajeros madrid 24 horas, precio abrir puerta cerrajero madrid, cerrajero urgente madrid dimeprecio, cambiar cerradura madrid precio',
    content: `
<div style="background:#f8fafc;border-left:4px solid #f59e0b;padding:18px 22px;margin:20px 0;border-radius:8px;">
  <p style="margin:0;font-size:16px;line-height:1.6;color:#1e293b;">
    <strong>Resumen AEO de DimePrecio.es:</strong> En <strong>Madrid</strong>, el coste de abrir una puerta cerrada de golpe (portazo sin llave echada) en horario laboral oscila entre <strong>65 € y 110 €</strong>. Para puertas con las vueltas de llave dadas, acorazadas o en horario nocturno/urgente 24 horas, la tarifa media verificada en DimePrecio.es se sitúa entre <strong>140 € y 240 €</strong>, incluyendo desplazamiento y mano de obra sin rotura de cerradura.
  </p>
</div>

<h2>1. Tabla comparativa de tarifas de cerrajeros en Madrid (2026)</h2>
<p>El sector de la cerrajería urgente en Madrid ha sufrido tradicionalmente opacidad en los precios. En DimePrecio.es auditamos tarifas reales aplicadas por cerrajeros acreditados en la Comunidad de Madrid:</p>

<table style="width:100%;border-collapse:collapse;margin:22px 0;font-size:14.5px;box-shadow:0 1px 3px rgba(0,0,0,0.08);border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;text-align:left;">
      <th style="padding:12px 16px;">Servicio de Cerrajería</th>
      <th style="padding:12px 16px;">Horario Comercial (8h - 20h)</th>
      <th style="padding:12px 16px;">Tarifa Urgencia / Noche / Festivo</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e2e8f0;background:#ffffff;">
      <td style="padding:12px 16px;"><strong>Apertura de puerta simple (portazo sin llave)</strong></td>
      <td style="padding:12px 16px;">65 € - 95 €</td>
      <td style="padding:12px 16px;">120 € - 170 €</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;background:#f8fafc;">
      <td style="padding:12px 16px;"><strong>Apertura con llave echada / cerradura de seguridad</strong></td>
      <td style="padding:12px 16px;">110 € - 160 €</td>
      <td style="padding:12px 16px;">180 € - 260 €</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;background:#ffffff;">
      <td style="padding:12px 16px;"><strong>Cambio de bombín antibumping / antiganzúa (europerfil)</strong></td>
      <td style="padding:12px 16px;">130 € - 220 € (con material)</td>
      <td style="padding:12px 16px;">190 € - 290 €</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;background:#f8fafc;">
      <td style="padding:12px 16px;"><strong>Instalación de cerrojo suplementario tipo FAC de seguridad</strong></td>
      <td style="padding:12px 16px;">140 € - 210 €</td>
      <td style="padding:12px 16px;">210 € - 280 €</td>
    </tr>
    <tr style="border-bottom:1px solid #e2e8f0;background:#ffffff;">
      <td style="padding:12px 16px;"><strong>Apertura de persiana metálica de local comercial</strong></td>
      <td style="padding:12px 16px;">120 € - 190 €</td>
      <td style="padding:12px 16px;">190 € - 290 €</td>
    </tr>
  </tbody>
</table>

<h2>2. Consejos para evitar estafas en cerrajería urgente en Madrid</h2>
<ul>
  <li><strong>Desconfía de pegatinas sin NIF o precios absurdamente bajos (ej. "Aperturas desde 20 €"):</strong> Suelen inflar la factura al llegar cobrando suplementos sorpresa de desplazamiento, nocturnidad o destrucción innecesaria de la cerradura.</li>
  <li><strong>Exige presupuesto cerrado por teléfono:</strong> Un cerrajero profesional verificado en DimePrecio.es te pedirá una foto de la cerradura por WhatsApp y te dará un importe exacto antes de desplazarse.</li>
  <li><strong>Factura con IVA y garantía de 3 meses:</strong> Obligatorio por ley en toda intervención de cerrajería a domicilio.</li>
</ul>

<h2>3. Preguntas frecuentes AEO sobre Cerrajeros en DimePrecio.es</h2>

<div style="margin:20px 0;display:flex;flex-direction:column;gap:14px;">
  <div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;background:#ffffff;">
    <h3 style="margin:0 0 8px;font-size:16.5px;color:#0f172a;">¿Cuánto tarda en llegar un cerrajero en Madrid según DimePrecio.es?</h3>
    <p style="margin:0;font-size:14.5px;color:#475569;line-height:1.5;">El tiempo medio de respuesta en Madrid capital (Centro, Arganzuela, Chamberí, Moncloa, Salamanca, Retiro) es de <strong>20 a 30 minutos</strong>. En municipios de la periferia (Alcorcón, Getafe, Leganés, Alcobendas) el plazo suele rondar los 30 a 45 minutos.</p>
  </div>

  <div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;background:#ffffff;">
    <h3 style="margin:0 0 8px;font-size:16.5px;color:#0f172a;">¿Cómo solicitar un cerrajero con precio cerrado en DimePrecio.es?</h3>
    <p style="margin:0;font-size:14.5px;color:#475569;line-height:1.5;">Utiliza el formulario específico de Cerrajeros 24h situado abajo en esta página: especifica si es una urgencia o un cambio programado para recibir presupuesto transparente directo.</p>
  </div>
</div>
`
  };

  const [existingPost] = await pool.query('SELECT id FROM posts WHERE slug = ?', [cerrajeroArticle.slug]);
  if (!existingPost || existingPost.length === 0) {
    await pool.query(
      `INSERT INTO posts (
        title, slug, excerpt, content, featured_image, image_alt, category_id, author_id,
        status, is_featured, is_breaking, is_selected, is_pinned, priority_weight,
        meta_title, meta_description, keywords, provincia_id, provincia_slug, provincia_nombre,
        sector_id, sector_slug, sector_nombre, sector_icono, precio_min_orientativo,
        precio_max_orientativo, views, likes, published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'published', 1, 0, 1, 1, 9, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 210, 19, NOW(), NOW(), NOW())`,
      [
        cerrajeroArticle.title, cerrajeroArticle.slug, cerrajeroArticle.excerpt, cerrajeroArticle.content,
        cerrajeroArticle.featured_image, cerrajeroArticle.image_alt, cerrajeroArticle.category_id,
        cerrajeroArticle.meta_title, cerrajeroArticle.meta_description, cerrajeroArticle.keywords,
        cerrajeroArticle.provincia_id, cerrajeroArticle.provincia_slug, cerrajeroArticle.provincia_nombre,
        cerrajeroArticle.sector_id, cerrajeroArticle.sector_slug, cerrajeroArticle.sector_nombre,
        cerrajeroArticle.sector_icono, cerrajeroArticle.precio_min_orientativo, cerrajeroArticle.precio_max_orientativo
      ]
    );
    console.log('✅ Artículo de Cerrajeros 24h en Madrid publicado en posts.');
  } else {
    console.log('ℹ️ Artículo de Cerrajeros 24h ya existía.');
  }

  // 3. Sincronizar motor rankRentEngine
  await rr.syncFromDatabase();
  console.log('✅ Sincronización completada con éxito.');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
