const mysql = require('mysql2/promise');
require('dotenv').config({ quiet: true });

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4'
  });

  // 1. Settings básicos
  await conn.query('INSERT IGNORE INTO settings (setting_key, setting_value) VALUES (?, ?)', ['site_name', 'DimePrecio.es']);
  await conn.query('INSERT IGNORE INTO settings (setting_key, setting_value) VALUES (?, ?)', ['site_domain', 'https://dimeprecio.es']);

  // 2. Usuario administrador
  await conn.query(
    "INSERT INTO users (id, username, email, display_name, role) VALUES (1, 'admin', 'admin@dimeprecio.es', 'DimePrecio.es Admin', 'admin') ON DUPLICATE KEY UPDATE username=username"
  );

  // 3. Dos categorías de ejemplo
  await conn.query(
    "INSERT INTO categories (id, name, slug, description, color) VALUES " +
    "(1, 'Reformas y Obras', 'reformas-y-obras', 'Guías de reformas e instalaciones en el hogar', '#2563eb'), " +
    "(2, 'Climatización y Energía', 'climatizacion-energia', 'Guías sobre aire acondicionado y ahorro energético', '#059669') " +
    "ON DUPLICATE KEY UPDATE name=name"
  );

  // 4. Provincias (Madrid y Barcelona)
  await conn.query(
    "INSERT INTO pp_locations (id, slug, nombre, comunidad_autonoma, modificador_precio_regional, municipios, activa) VALUES " +
    "(1, 'madrid', 'Madrid', 'Comunidad de Madrid', 1.15, '[\"Madrid Centro\",\"Móstoles\",\"Alcalá de Henares\",\"Getafe\"]', 1), " +
    "(2, 'barcelona', 'Barcelona', 'Cataluña', 1.15, '[\"Barcelona Centro\",\"Badalona\",\"Hospitalet\"]', 1), " +
    "(3, 'valencia', 'Valencia', 'Comunidad Valenciana', 1.00, '[\"Valencia Centro\",\"Torrent\",\"Gandía\"]', 1) " +
    "ON DUPLICATE KEY UPDATE nombre=nombre"
  );

  // 5. Dos sectores de ejemplo
  await conn.query(
    "INSERT INTO pp_sectors (id, slug, nombre, icono, tier, keywords, formula_precio_base_json, activo) VALUES " +
    "(1, 'reformas-integrales', 'Reformas Integrales y Baños/Cocinas', '🏗️', 'ticket_alto', '[\"reformas\",\"baño\",\"cocina\"]', '{\"min\":1200,\"max\":8000}', 1), " +
    "(2, 'climatizacion-aire-acondicionado', 'Climatización y Aire Acondicionado', '❄️', 'ticket_medio', '[\"aire acondicionado\",\"climatizacion\",\"frigorias\"]', '{\"min\":450,\"max\":2200}', 1) " +
    "ON DUPLICATE KEY UPDATE nombre=nombre"
  );

  // 6. Formularios de ejemplo para estos 2 sectores
  await conn.query(
    "INSERT INTO pp_sector_forms (form_key, sector_slug, sector_nombre, provincia_slug, titulo, titulo_formulario, explicacion_cliente, permitir_adjuntos, calculadora_json) VALUES " +
    "('reformas-integrales__todas', 'reformas-integrales', 'Reformas Integrales', 'todas', 'Pedir Presupuesto Reformas', 'Formulario Oficial de Reformas', 'Indica las estancias a reformar y m²', 1, '{\"activa\":true,\"tipo\":\"reforma_m2\"}'), " +
    "('climatizacion-aire-acondicionado__todas', 'climatizacion-aire-acondicionado', 'Climatización y Aire Acondicionado', 'todas', 'Pedir Presupuesto Aire Acondicionado', 'Formulario Oficial de Climatización', 'Indica los m² para calcular frigorías requeridas', 1, '{\"activa\":true,\"tipo\":\"frigorias\"}') " +
    "ON DUPLICATE KEY UPDATE titulo=titulo"
  );

  // 7. Dos anuncios anónimos de ejemplo
  await conn.query(
    "INSERT INTO pp_ads (id, codigo, titulo, subtitulo, cta_texto, marca_visible, es_anonimo, provincia_slug, provincia_nombre, sector_slug, sector_nombre, municipios_cubiertos, fijado, seleccionado, activo) VALUES " +
    "(1, 'PP-AD-MAD-01', '¿Necesitas Reformas en Madrid? Solicita presupuesto en tu zona', 'Presupuestos verificados de empresas y autónomos locales.', 'Solicitar Presupuesto', 'DimePrecio.es', 1, 'madrid', 'Madrid', 'reformas-integrales', 'Reformas Integrales', '[\"Madrid Centro\",\"Móstoles\"]', 1, 1, 1), " +
    "(2, 'PP-AD-MAD-02', 'Instaladores de Aire Acondicionado en Madrid', 'Cálculo de frigorías e instalación rápida sin compromiso.', 'Calcular Frigorías', 'DimePrecio.es', 1, 'madrid', 'Madrid', 'climatizacion-aire-acondicionado', 'Climatización y Aire Acondicionado', '[\"Madrid Centro\"]', 1, 1, 1) " +
    "ON DUPLICATE KEY UPDATE titulo=titulo"
  );

  // 8. Dos artículos de ejemplo
  await conn.query(
    "INSERT INTO posts (id, title, slug, excerpt, content, featured_image, category_id, status, is_featured, is_selected, provincia_slug, provincia_nombre, sector_slug, sector_nombre, views, published_at) VALUES " +
    "(1, 'Guía de Precios de Reformas en Madrid (2026)', 'guia-precios-reformas-madrid-2026', 'Cuánto cuesta reformar un baño o cocina en Madrid.', '<p>En esta guía explicamos los costes medios por metro cuadrado en reformas integrales y parciales en la provincia de Madrid.</p>', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80', 1, 'published', 1, 1, 'madrid', 'Madrid', 'reformas-integrales', 'Reformas Integrales', 15, NOW()), " +
    "(2, 'Instalación de Aire Acondicionado y Cálculo de Frigorías en Madrid', 'instalacion-aire-acondicionado-madrid', 'Aprende a calcular las frigorías necesarias para tu vivienda.', '<p>Guía técnica paso a paso para seleccionar el equipo inverter adecuado según los metros cuadrados de tu estancia.</p>', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80', 2, 'published', 0, 1, 'madrid', 'Madrid', 'climatizacion-aire-acondicionado', 'Climatización y Aire Acondicionado', 22, NOW()) " +
    "ON DUPLICATE KEY UPDATE title=title"
  );

  console.log('Datos iniciales mínimos insertados con éxito.');
  await conn.end();
})();
