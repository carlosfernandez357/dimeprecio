const pool = require('../db');

const CTA_BLOCK = (title, sector) => `
<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:28px 0;text-align:center;">
  <h3 style="margin-top:0;color:#166534;font-size:18px;">¿Necesitas asesoramiento o presupuesto cerrado en Madrid?</h3>
  <p style="color:#15803d;margin-bottom:15px;font-size:14px;">Contacta gratis con operadores especializados de DimePrecio.es para profesionales de ${sector} en la Comunidad de Madrid.</p>
  <a href="tel:+34622158703" style="display:inline-block;background:#15803d;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:700;text-decoration:none;font-size:15px;">📞 Llamar a un operador (+34 622 15 87 03)</a>
</div>
`;

async function addCallButtonToAll() {
  const [rows] = await pool.query(
    'SELECT id, title, sector_nombre, content FROM posts WHERE provincia_slug = "madrid"'
  );

  console.log(`Revisando ${rows.length} artículos de Madrid para garantizar botón de llamada...`);

  for (const r of rows) {
    if (!r.content.includes('+34 622 15 87 03')) {
      const updatedContent = r.content.trim() + '\n' + CTA_BLOCK(r.title, r.sector_nombre).trim();
      await pool.query('UPDATE posts SET content = ? WHERE id = ?', [updatedContent, r.id]);
      console.log(` - Añadido botón de operador a: [${r.id}] ${r.title}`);
    }
  }

  console.log('¡Todos los 30 artículos tienen ahora el botón de llamada a operador (+34 622 15 87 03)!');
  process.exit(0);
}

addCallButtonToAll().catch((e) => {
  console.error(e);
  process.exit(1);
});
