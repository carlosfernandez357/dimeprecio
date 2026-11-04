const mysql = require('mysql2/promise');
require('dotenv').config({ quiet: true });

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  await conn.query("UPDATE settings SET setting_value = REPLACE(setting_value, 'PidePrecio', 'DimePrecio')");
  await conn.query("UPDATE settings SET setting_value = REPLACE(setting_value, 'pideprecio', 'dimeprecio')");

  await conn.query("UPDATE pp_ads SET titulo = REPLACE(titulo, 'PidePrecio', 'DimePrecio'), subtitulo = REPLACE(subtitulo, 'PidePrecio', 'DimePrecio'), marca_visible = 'DimePrecio.es'");
  await conn.query("UPDATE pp_sector_forms SET titulo = REPLACE(titulo, 'PidePrecio', 'DimePrecio'), explicacion_cliente = REPLACE(explicacion_cliente, 'PidePrecio', 'DimePrecio')");
  await conn.query("UPDATE posts SET content = REPLACE(content, 'PidePrecio', 'DimePrecio'), meta_title = REPLACE(meta_title, 'PidePrecio', 'DimePrecio')");
  await conn.query("UPDATE users SET display_name = 'DimePrecio.es Admin', email = REPLACE(email, 'pideprecio', 'dimeprecio')");

  console.log('BD actualizada a DimePrecio con éxito.');
  await conn.end();
})();
