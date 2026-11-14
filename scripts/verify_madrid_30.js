const pool = require('../db');

async function verify() {
  const [rows] = await pool.query(
    'SELECT id, slug, sector_nombre, title, featured_image, content FROM posts WHERE provincia_slug = "madrid" ORDER BY id ASC'
  );

  console.log(`=== TOTAL ARTÍCULOS MADRID EN BD: ${rows.length} ===\n`);
  
  let allHavePhone = true;
  let allHaveImages = true;
  let allHaveAEO = true;
  const imageSet = new Set();
  const slugSet = new Set();

  rows.forEach((r, i) => {
    const hasPhone = r.content.includes('+34 622 15 87 03');
    const hasAEO = r.content.includes('Resumen AEO');
    const hasImg = !!r.featured_image;

    if (!hasPhone) allHavePhone = false;
    if (!hasAEO) allHaveAEO = false;
    if (!hasImg) allHaveImages = false;

    imageSet.add(r.featured_image);
    slugSet.add(r.slug);

    console.log(`${i + 1}. [${r.sector_nombre}] ${r.title}`);
    console.log(`   URL: https://dimeprecio.es/article/${r.slug}`);
    console.log(`   Teléfono OK: ${hasPhone} | AEO OK: ${hasAEO} | Foto: ${r.featured_image.substring(0, 55)}...`);
  });

  console.log('\n--- VERIFICACIÓN DE CALIDAD ---');
  console.log(`Artículos totales: ${rows.length} / 30`);
  console.log(`Imágenes únicas: ${imageSet.size} / ${rows.length}`);
  console.log(`Slugs únicos: ${slugSet.size} / ${rows.length}`);
  console.log(`Todos con teléfono (+34 622 15 87 03): ${allHavePhone}`);
  console.log(`Todos con Resumen AEO optimizado: ${allHaveAEO}`);
  console.log(`Todos con foto verificada: ${allHaveImages}`);

  process.exit(0);
}

verify().catch((e) => {
  console.error(e);
  process.exit(1);
});
