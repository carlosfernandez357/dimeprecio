// ============================================================================
// PidePrecio.es — Preparación de la base de datos MySQL
//   1) Crea todas las tablas (database/schema.sql)
//   2) Carga los datos iniciales desde data/pideprecio-store.json
//      (52 provincias, 30 sectores, formularios, anuncios, categorías, páginas…)
// Es idempotente: se puede ejecutar varias veces sin duplicar datos.
// Uso:  npm run db:setup
// ============================================================================
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const rr = require('../utils/rankRentEngine');

const J = v => (v === undefined || v === null ? null : JSON.stringify(v));
const B = v => (v ? 1 : 0);
const D = v => (v ? new Date(v) : null);

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    multipleStatements: true,
    connectTimeout: 10000,
  });
  console.log(`✔ Conectado a ${process.env.DB_NAME} en ${process.env.DB_HOST}`);

  // 1) Esquema
  await conn.query(fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8'));
  console.log('✔ Tablas creadas / verificadas');

  const s = rr.loadStore();

  // 2) Ajustes
  for (const [k, v] of Object.entries(s.settings || {})) {
    await conn.query(
      'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
      [k, typeof v === 'object' ? JSON.stringify(v) : String(v)]
    );
  }
  console.log(`✔ settings: ${Object.keys(s.settings || {}).length}`);

  // 3) Usuario admin (sin contraseña: el acceso al panel usa ADMIN_USER / ADMIN_PASSWORD del .env)
  await conn.query(
    `INSERT INTO users (id, username, email, display_name, role) VALUES (1, 'admin', 'admin@pideprecio.es', 'PidePrecio.es', 'admin')
     ON DUPLICATE KEY UPDATE display_name = VALUES(display_name)`
  );

  // 4) Categorías
  for (const c of s.categories || []) {
    await conn.query(
      `INSERT INTO categories (id, name, slug, description, color) VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), color = VALUES(color)`,
      [c.id, c.name, c.slug, c.description || '', c.color || '#0f4c81']
    );
  }
  console.log(`✔ categories: ${(s.categories || []).length}`);

  // 5) Provincias
  for (const l of s.locations || []) {
    await conn.query(
      `INSERT INTO pp_locations (id, slug, nombre, comunidad_autonoma, lat, lng, poblacion, modificador_precio_regional, municipios, activa)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), comunidad_autonoma = VALUES(comunidad_autonoma), lat = VALUES(lat), lng = VALUES(lng),
         poblacion = VALUES(poblacion), modificador_precio_regional = VALUES(modificador_precio_regional), municipios = VALUES(municipios), activa = VALUES(activa)`,
      [l.id, l.slug, l.nombre, l.comunidad_autonoma, l.lat, l.lng, l.poblacion, l.modificador_precio_regional || 1, J(l.municipios), B(l.activa !== false)]
    );
  }
  console.log(`✔ pp_locations: ${(s.locations || []).length}`);

  // 6) Sectores
  for (const x of s.sectors || []) {
    await conn.query(
      `INSERT INTO pp_sectors (id, slug, nombre, icono, tier, keywords, business_models, precios_negocio, formulario_presupuesto, formula_precio_base_json, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), icono = VALUES(icono), tier = VALUES(tier), keywords = VALUES(keywords),
         business_models = VALUES(business_models), precios_negocio = VALUES(precios_negocio),
         formulario_presupuesto = VALUES(formulario_presupuesto), formula_precio_base_json = VALUES(formula_precio_base_json), activo = VALUES(activo)`,
      [x.id, x.slug, x.nombre, x.icono, x.tier, J(x.keywords), J(x.business_models), J(x.precios_negocio), J(x.formulario_presupuesto), J(x.formula_precio_base_json), B(x.activo !== false)]
    );
  }
  console.log(`✔ pp_sectors: ${(s.sectors || []).length}`);

  // 7) Formularios por sector
  for (const [slug, f] of Object.entries(s.custom_forms || {})) {
    await conn.query(
      `INSERT INTO pp_sector_forms (form_key, sector_slug, sector_nombre, provincia_slug, titulo, titulo_formulario, explicacion_cliente, instrucciones_cliente,
         explicacion_label, explicacion_placeholder, calculadora_json, campos_json, permitir_adjuntos, formatos_admitidos, plantilla_descargable_url, plantilla_nombre_archivo)
       VALUES (?, ?, ?, 'todas', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE titulo = VALUES(titulo), titulo_formulario = VALUES(titulo_formulario), explicacion_cliente = VALUES(explicacion_cliente),
         instrucciones_cliente = VALUES(instrucciones_cliente), explicacion_label = VALUES(explicacion_label), explicacion_placeholder = VALUES(explicacion_placeholder),
         calculadora_json = VALUES(calculadora_json), campos_json = VALUES(campos_json), permitir_adjuntos = VALUES(permitir_adjuntos), formatos_admitidos = VALUES(formatos_admitidos)`,
      [`${slug}__todas`, slug, f.sector_nombre, f.titulo, f.titulo_formulario, f.explicacion_cliente, f.instrucciones_cliente,
        f.explicacion_label, f.explicacion_placeholder, J(f.calculadora_json), J({ campos: f.campos || [], campos_personalizados: f.campos_personalizados || [] }),
        B(f.permitir_adjuntos !== false), f.formatos_admitidos, f.plantilla_descargable_url, f.plantilla_nombre_archivo]
    );
  }
  console.log(`✔ pp_sector_forms: ${Object.keys(s.custom_forms || {}).length}`);

  // 8) Anuncios (solo si la tabla está vacía, para no duplicar)
  const [[{ nAds }]] = await conn.query('SELECT COUNT(*) AS nAds FROM pp_ads');
  if (nAds === 0) {
    for (const a of s.ads || []) {
      await conn.query(
        `INSERT INTO pp_ads (codigo, titulo, subtitulo, badge, sello, cta_texto, marca_visible, es_anonimo, provincia_slug, provincia_nombre, sector_slug, sector_nombre,
           sector_icono, municipios_cubiertos, fijado, seleccionado, prioridad, activo, impresiones, clics, conversiones)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [a.codigo, a.titulo, a.subtitulo, a.badge, a.sello, a.cta_texto, a.marca_visible || 'PidePrecio.es', B(a.es_anonimo !== false), a.provincia_slug, a.provincia_nombre,
          a.sector_slug, a.sector_nombre, a.sector_icono, J(a.municipios_cubiertos), B(a.fijado), B(a.seleccionado), a.prioridad || 8, B(a.activo !== false),
          a.impresiones || 0, a.clics || 0, a.conversiones || 0]
      );
    }
  }
  console.log(`✔ pp_ads: ${(s.ads || []).length}`);

  // 9) Páginas / artículos
  for (const p of s.posts || []) {
    await conn.query(
      `INSERT INTO posts (id, title, slug, excerpt, content, featured_image, image_alt, category_id, author_id, status, is_featured, is_breaking, is_selected, is_pinned,
         priority_weight, meta_title, meta_description, keywords, provincia_id, provincia_slug, provincia_nombre, sector_id, sector_slug, sector_nombre, sector_icono,
         municipio_tag, precio_min_orientativo, precio_max_orientativo, views, likes, published_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE title = VALUES(title), excerpt = VALUES(excerpt), content = VALUES(content), featured_image = VALUES(featured_image), status = VALUES(status)`,
      [p.id, p.title, p.slug, p.excerpt, p.content, p.featured_image, p.image_alt, p.category_id, p.author_id || 1, p.status || 'published', p.is_featured || 0, p.is_breaking || 0,
        p.is_selected || 0, p.is_pinned || 0, p.priority_weight || 5, p.meta_title, p.meta_description, p.keywords, p.provincia_id, p.provincia_slug, p.provincia_nombre,
        p.sector_id, p.sector_slug, p.sector_nombre, p.sector_icono, p.municipio_tag, p.precio_min_orientativo, p.precio_max_orientativo, p.views || 0, p.likes || 0,
        D(p.published_at), D(p.created_at) || new Date()]
    );
  }
  console.log(`✔ posts: ${(s.posts || []).length}`);

  // 10) Solicitudes de presupuesto de demostración (solo si está vacía)
  const [[{ nQr }]] = await conn.query('SELECT COUNT(*) AS nQr FROM pp_quote_requests');
  if (nQr === 0) {
    for (const q of s.quote_requests || []) {
      await conn.query(
        `INSERT INTO pp_quote_requests (codigo, provincia_slug, provincia_nombre, municipio, sector_slug, sector_nombre, anuncio_id, contenido_origen_id, origen_titulo,
           nombre_cliente, telefono_whatsapp, email_opcional, campos_formulario_json, explicacion_cliente, archivos_adjuntos_json, modelo_negocio_aplicado,
           precio_venta_lead, valor_estimado_trabajo, estado_agente, contacto_desbloqueado, payment_link, notas_agente)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [q.codigo, q.provincia_slug, q.provincia_nombre, q.municipio, q.sector_slug, q.sector_nombre, q.anuncio_id, q.contenido_origen_id, q.origen_titulo,
          q.nombre_cliente, q.telefono_whatsapp, q.email_opcional, J(q.campos_formulario_json), q.explicacion_cliente, J(q.archivos_adjuntos), q.modelo_negocio_aplicado,
          q.precio_venta_lead, q.valor_estimado_trabajo, q.estado_agente, B(q.contacto_desbloqueado), q.payment_link, q.notas_agente]
      );
    }
  }
  console.log(`✔ pp_quote_requests: ${(s.quote_requests || []).length}`);

  // Ajustar autoincrementos tras insertar con id explícito
  await conn.query('ALTER TABLE posts AUTO_INCREMENT = 1');

  const [tablas] = await conn.query('SHOW TABLES');
  console.log(`\n✅ Listo. Tablas en la base de datos: ${tablas.length}`);
  await conn.end();
})().catch(e => {
  console.error('\n✖ Error:', e.code || '', e.message);
  if (e.code === 'ER_ACCESS_DENIED_ERROR') console.error('  → Añade tu IP en hPanel → Bases de datos → MySQL remoto, y revisa usuario/contraseña en .env');
  process.exit(1);
});
