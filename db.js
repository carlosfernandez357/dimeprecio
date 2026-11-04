// ============================================================================
// PidePrecio.es — Conexión de Base de Datos (Basado en socialsforce db.js)
// Conecta a MySQL en producción y sincroniza automáticamente con el almacén
// de PidePrecio.es (data/pideprecio-store.json) si MySQL local no está activo.
// ============================================================================
const mysql = require('mysql2/promise');
const rr = require('./utils/rankRentEngine');

const rawPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u256818095_dimeprecio',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'u256818095_dimeprecio',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  connectTimeout: 2500,
});

let mysqlOnline = null;

async function ensureMySqlSchema() {
  try {
    await rawPool.query(`
      CREATE TABLE IF NOT EXISTS pp_ads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(64) NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        subtitulo TEXT,
        badge VARCHAR(140),
        sello VARCHAR(140),
        cta_texto VARCHAR(100),
        provincia_slug VARCHAR(80),
        sector_slug VARCHAR(100),
        modelo_negocio VARCHAR(50) DEFAULT 'lead_directo',
        precio_lead DECIMAL(10,2) DEFAULT 35.00,
        cuota_mensual DECIMAL(10,2) DEFAULT 400.00,
        comision_pct DECIMAL(5,2) DEFAULT 12.00,
        whatsapp_destino VARCHAR(40),
        payment_link VARCHAR(255),
        seleccionado TINYINT(1) DEFAULT 1,
        prioridad INT DEFAULT 8,
        activo TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await rawPool.query(`
      CREATE TABLE IF NOT EXISTS pp_quote_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(40) NOT NULL,
        provincia_slug VARCHAR(80),
        municipio VARCHAR(140),
        sector_slug VARCHAR(100),
        nombre_cliente VARCHAR(140),
        telefono_whatsapp VARCHAR(50),
        email_opcional VARCHAR(140),
        campos_formulario_json JSON,
        explicacion_cliente TEXT,
        archivos_adjuntos_json JSON,
        modelo_negocio_aplicado VARCHAR(50),
        precio_venta_lead DECIMAL(10,2) DEFAULT 35.00,
        valor_estimado_trabajo DECIMAL(12,2) DEFAULT 1500.00,
        estado_agente VARCHAR(50) DEFAULT 'nuevo_en_bandeja',
        contacto_desbloqueado TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await rawPool.query(`
      CREATE TABLE IF NOT EXISTS pp_sector_forms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        form_key VARCHAR(160) NOT NULL UNIQUE,
        sector_slug VARCHAR(100) NOT NULL,
        provincia_slug VARCHAR(80) DEFAULT 'todas',
        titulo_formulario VARCHAR(255),
        instrucciones_cliente TEXT,
        explicacion_label VARCHAR(255),
        explicacion_placeholder TEXT,
        calculadora_json JSON,
        campos_json JSON,
        permitir_adjuntos TINYINT(1) DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await rawPool.query(`
      CREATE TABLE IF NOT EXISTS pp_visitor_interests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        visitor_id VARCHAR(120) NOT NULL,
        provincia_slug VARCHAR(80),
        sector_slug VARCHAR(100),
        last_post_id INT NULL,
        hits INT DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_visitor (visitor_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (e) {
    // Ignorar si MySQL está desconectado en entorno local
  }
}

// Emulador SQL sobre el almacén de PidePrecio.es para que todas las consultas
// de socialsforce (posts, categories, schedules, settings, visitors, etc.)
// funcionen exactamente igual tanto con MySQL como en modo local.
function executeLocalQuery(sql, params = []) {
  const s = rr.loadStore();
  const norm = String(sql || '').replace(/\s+/g, ' ').trim();
  const upper = norm.toUpperCase();

  // 1. SELECT COUNT(*) FROM posts ...
  if (upper.startsWith('SELECT COUNT(*) AS TOTAL FROM POSTS') || upper.startsWith('SELECT COUNT(*) AS C FROM POSTS')) {
    let list = [...(s.posts || [])];
    if (upper.includes("STATUS = 'PUBLISHED'")) {
      list = list.filter(p => p.status === 'published');
    }
    const key = upper.includes('AS C') ? 'c' : 'total';
    return [[{ [key]: list.length }], []];
  }

  if (upper.startsWith('SELECT COUNT(*) AS TOTAL FROM CATEGORIES')) {
    return [[{ total: (s.categories || []).length }], []];
  }

  if (upper.startsWith('SELECT COUNT(*) AS TOTAL FROM SCHEDULES')) {
    return [[{ total: (s.schedules || []).length }], []];
  }

  if (upper.startsWith('SELECT SUM(VIEWS) AS TOTAL FROM POSTS')) {
    const sum = (s.posts || []).reduce((acc, p) => acc + (Number(p.views) || 0), 0);
    return [[{ total: sum }], []];
  }

  // 2. Settings
  if (upper.includes('FROM SETTINGS')) {
    const rows = Object.entries(s.settings || {}).map(([k, v]) => ({
      setting_key: k,
      setting_value: typeof v === 'object' ? JSON.stringify(v) : String(v),
    }));
    return [rows, []];
  }

  if (upper.startsWith('INSERT INTO SETTINGS') || upper.startsWith('UPDATE SETTINGS')) {
    if (params.length >= 2) {
      s.settings[params[0]] = params[1];
      rr.saveStore();
    }
    return [{ affectedRows: 1 }, []];
  }

  // 3. Categories
  if (upper.includes('FROM CATEGORIES')) {
    const cats = (s.categories || []).map(c => ({
      ...c,
      post_count: (s.posts || []).filter(p => Number(p.category_id) === Number(c.id) && p.status === 'published').length,
    }));
    if (upper.includes('WHERE SLUG = ?') && params[0]) {
      return [cats.filter(c => c.slug === params[0]), []];
    }
    if (upper.includes('WHERE ID = ?') && params[0]) {
      return [cats.filter(c => Number(c.id) === Number(params[0])), []];
    }
    return [cats, []];
  }

  if (upper.startsWith('INSERT INTO CATEGORIES')) {
    const newId = (s.categories || []).reduce((m, c) => Math.max(m, Number(c.id) || 0), 0) + 1;
    const cat = {
      id: newId,
      name: params[0] || 'Nueva Categoría',
      slug: params[1] || rr.slugify(params[0] || 'categoria'),
      description: params[2] || '',
      color: params[3] || '#0f4c81',
    };
    s.categories.push(cat);
    rr.saveStore();
    return [{ insertId: newId, affectedRows: 1 }, []];
  }

  if (upper.startsWith('DELETE FROM CATEGORIES')) {
    const id = Number(params[0]);
    s.categories = (s.categories || []).filter(c => Number(c.id) !== id);
    rr.saveStore();
    return [{ affectedRows: 1 }, []];
  }

  // 4. Users (Admin auth)
  if (upper.includes('FROM USERS')) {
    return [[{
      id: 1,
      username: 'admin',
      email: 'admin@pideprecio.es',
      display_name: 'PidePrecio.es',
      role: 'admin',
    }], []];
  }

  // 5. Schedules (Programación automática de páginas con IA como en socialsforce)
  if (upper.includes('FROM SCHEDULES')) {
    let list = [...(s.schedules || [])];
    if (upper.includes('WHERE IS_ACTIVE = 1')) {
      list = list.filter(sc => sc.is_active);
    }
    return [list, []];
  }

  if (upper.startsWith('INSERT INTO SCHEDULES')) {
    const newId = (s.schedules || []).reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;
    const sched = {
      id: newId,
      topic: params[0] || 'Guía de precios de reformas y servicios en España',
      category_id: params[1] || 1,
      provincia_slug: params[5] || 'madrid',
      sector_slug: params[6] || 'reformas-integrales-banos-cocinas',
      frequency: params[2] || 'daily',
      cron_expr: params[3] || '0 9 * * *',
      auto_publish: params[4] !== undefined ? Number(params[4]) : 1,
      is_active: 1,
      last_run: null,
      created_at: new Date().toISOString(),
    };
    s.schedules.push(sched);
    rr.saveStore();
    return [{ insertId: newId, affectedRows: 1 }, []];
  }

  if (upper.startsWith('UPDATE SCHEDULES')) {
    const id = Number(params[params.length - 1]);
    const item = (s.schedules || []).find(x => Number(x.id) === id);
    if (item) {
      if (upper.includes('LAST_RUN')) item.last_run = new Date().toISOString();
      if (upper.includes('IS_ACTIVE')) item.is_active = item.is_active ? 0 : 1;
      rr.saveStore();
    }
    return [{ affectedRows: 1 }, []];
  }

  if (upper.startsWith('DELETE FROM SCHEDULES')) {
    const id = Number(params[0]);
    s.schedules = (s.schedules || []).filter(x => Number(x.id) !== id);
    rr.saveStore();
    return [{ affectedRows: 1 }, []];
  }

  // 6. Posts / Páginas IA creadas por PidePrecio.es
  if (upper.startsWith('INSERT INTO POSTS')) {
    const newId = (s.posts || []).reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;
    const catId = Number(params[6]) || 1;
    const cat = (s.categories || []).find(c => Number(c.id) === catId) || s.categories[0];

    // Detectar provincia y sector si vienen o inferir del título/keywords
    const titleStr = String(params[0] || 'Nueva Página PidePrecio.es');
    const titleNorm = titleStr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let prov = s.locations.find(l => titleNorm.includes(l.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) || s.locations[27]; // Madrid fallback
    let sec = s.sectors.find(secItem => titleNorm.includes(secItem.slug.split('-')[0])) || s.sectors[0];

    const newPost = {
      id: newId,
      title: titleStr,
      slug: params[1] || rr.slugify(`${titleStr}-${newId}`),
      excerpt: params[2] || '',
      content: params[3] || '',
      featured_image: params[4] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80',
      image_alt: params[5] || `${titleStr} - PidePrecio.es`,
      category_id: catId,
      category_name: cat ? cat.name : 'Presupuestos y Tarifas',
      category_slug: cat ? cat.slug : 'reformas-y-construccion',
      category_color: cat ? cat.color : '#0f4c81',
      author_id: 1,
      author_name: 'PidePrecio.es',
      status: params[8] || 'published',
      is_featured: Number(params[9]) || 0,
      is_breaking: Number(params[10]) || 0,
      is_selected: 1,
      priority_weight: 9,
      meta_title: params[11] || `${titleStr} | PidePrecio.es`,
      meta_description: params[12] || params[2] || '',
      keywords: params[13] || '',
      provincia_id: prov.id,
      provincia_slug: prov.slug,
      provincia_nombre: prov.nombre,
      sector_id: sec.id,
      sector_slug: sec.slug,
      sector_nombre: sec.nombre,
      sector_icono: sec.icono,
      municipio_tag: (prov.municipios && prov.municipios[0]) || prov.nombre,
      precio_min_orientativo: Math.round((sec.formula_precio_base_json?.min || 150) * (prov.modificador_precio_regional || 1)),
      precio_max_orientativo: Math.round((sec.formula_precio_base_json?.max || 1800) * (prov.modificador_precio_regional || 1)),
      views: 1,
      likes: 1,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    s.posts.unshift(newPost);
    rr.saveStore();
    return [{ insertId: newId, affectedRows: 1 }, []];
  }

  if (upper.startsWith('UPDATE POSTS SET VIEWS = VIEWS + 1')) {
    const id = Number(params[0]);
    const post = (s.posts || []).find(p => Number(p.id) === id);
    if (post) {
      post.views = (Number(post.views) || 0) + 1;
      rr.saveStore();
    }
    return [{ affectedRows: 1 }, []];
  }

  if (upper.startsWith('UPDATE POSTS SET LIKES = LIKES + 1')) {
    const id = Number(params[0]);
    const post = (s.posts || []).find(p => Number(p.id) === id);
    if (post) {
      post.likes = (Number(post.likes) || 0) + 1;
      rr.saveStore();
    }
    return [{ affectedRows: 1 }, []];
  }

  if (upper.startsWith('UPDATE POSTS')) {
    const id = Number(params[params.length - 1]);
    const post = (s.posts || []).find(p => Number(p.id) === id);
    if (post && params.length >= 10) {
      post.title = params[0] || post.title;
      post.slug = params[1] || post.slug;
      post.excerpt = params[2] ?? post.excerpt;
      post.content = params[3] ?? post.content;
      if (params[4]) post.featured_image = params[4];
      post.image_alt = params[5] ?? post.image_alt;
      post.category_id = Number(params[6]) || post.category_id;
      post.status = params[7] || post.status;
      post.is_featured = Number(params[8]) || 0;
      post.is_breaking = Number(params[9]) || 0;
      post.meta_title = params[10] || post.meta_title;
      post.meta_description = params[11] || post.meta_description;
      post.keywords = params[12] || post.keywords;
      rr.saveStore();
    }
    return [{ affectedRows: 1 }, []];
  }

  if (upper.startsWith('DELETE FROM POSTS')) {
    const id = Number(params[0]);
    s.posts = (s.posts || []).filter(p => Number(p.id) !== id);
    rr.saveStore();
    return [{ affectedRows: 1 }, []];
  }

  if (upper.includes('FROM POSTS')) {
    let list = (s.posts || []).map(p => {
      const cat = (s.categories || []).find(c => Number(c.id) === Number(p.category_id)) || s.categories[0] || {};
      return {
        ...p,
        category_name: p.category_name || cat.name || 'Presupuestos y Tarifas',
        category_slug: p.category_slug || cat.slug || 'reformas-y-construccion',
        category_color: p.category_color || cat.color || '#0f4c81',
        author_name: 'PidePrecio.es',
      };
    });

    if (upper.includes("P.STATUS = 'PUBLISHED'") || upper.includes("STATUS = 'PUBLISHED'")) {
      list = list.filter(p => p.status === 'published');
    }

    if (upper.includes('P.SLUG = ?') || upper.includes('WHERE SLUG = ?')) {
      const slugParam = params[0];
      list = list.filter(p => p.slug === slugParam);
      return [list, []];
    }

    if ((upper.includes('P.ID = ?') || upper.includes('WHERE ID = ?')) && !upper.includes('P.ID != ?')) {
      const idParam = Number(params[0]);
      list = list.filter(p => Number(p.id) === idParam);
      return [list, []];
    }

    if (upper.includes('P.CATEGORY_ID = ?')) {
      const catParam = Number(params[0]);
      list = list.filter(p => Number(p.category_id) === catParam);
    }

    if (upper.includes('PROVINCIA_SLUG = ?') && upper.includes('SECTOR_SLUG = ?') && params.length >= 2) {
      list = list.filter(p => p.provincia_slug === params[0] && p.sector_slug === params[1]);
    } else if (upper.includes('PROVINCIA_SLUG = ?') && params[0]) {
      list = list.filter(p => p.provincia_slug === params[0]);
    } else if (upper.includes('SECTOR_SLUG = ?') && params[0]) {
      list = list.filter(p => p.sector_slug === params[0]);
    }

    if (upper.includes('P.IS_FEATURED = 1')) {
      const featured = list.filter(p => Number(p.is_featured) === 1);
      if (featured.length > 0) list = featured;
    }

    if (upper.includes('P.IS_BREAKING = 1')) {
      const breaking = list.filter(p => Number(p.is_breaking) === 1);
      if (breaking.length > 0) list = breaking;
    }

    if (upper.includes('ORDER BY P.VIEWS DESC') || upper.includes('ORDER BY VIEWS DESC')) {
      list.sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0));
    } else {
      list.sort((a, b) => {
        if ((Number(b.is_selected) || 0) !== (Number(a.is_selected) || 0)) {
          return (Number(b.is_selected) || 0) - (Number(a.is_selected) || 0);
        }
        return new Date(b.published_at || b.created_at || 0) - new Date(a.published_at || a.created_at || 0);
      });
    }

    const limitMatch = upper.match(/LIMIT\s+(\d+)/);
    if (limitMatch) {
      list = list.slice(0, Number(limitMatch[1]));
    } else if (params.length > 0 && upper.includes('LIMIT ?')) {
      const lastNum = Number(params[params.length - 1]);
      if (lastNum > 0 && lastNum <= 200) list = list.slice(0, lastNum);
    }

    return [list, []];
  }

  // 7. Provincias / Zonas (pp_locations)
  if (upper.includes('FROM PP_LOCATIONS')) {
    let locs = rr.getLocations(upper.includes('ACTIVA = 1'));
    if (upper.includes('WHERE SLUG = ?') && params[0]) {
      const found = rr.getLocationBySlug(params[0]);
      return [found ? [found] : [], []];
    }
    return [locs, []];
  }

  // 8. Sectores / Servicios (pp_sectors)
  if (upper.includes('FROM PP_SECTORS')) {
    let secs = rr.getSectors(upper.includes('ACTIVO = 1'));
    if (upper.includes('WHERE SLUG = ?') && params[0]) {
      const found = rr.getSectorBySlug(params[0]);
      return [found ? [found] : [], []];
    }
    return [secs, []];
  }

  // 9. Formularios y Calculadores de Base de Datos por Sector (pp_sector_forms)
  if (upper.includes('FROM PP_SECTOR_FORMS')) {
    const sectorSlug = params[0] || 'reformas-integrales';
    const provSlug = params[1] || null;
    const formObj = rr.getCustomForm(sectorSlug, provSlug);
    return [formObj ? [formObj] : [], []];
  }

  if (upper.startsWith('INSERT INTO PP_SECTOR_FORMS') || upper.startsWith('UPDATE PP_SECTOR_FORMS')) {
    const payload = typeof params[0] === 'object' ? params[0] : {};
    const saved = rr.saveCustomForm(payload);
    return [{ affectedRows: 1, form: saved }, []];
  }

  // 10. Anuncios Recomendados en Base de Datos (pp_ads)
  if (upper.includes('FROM PP_ADS')) {
    let list = rr.getAds({
      provincia_slug: (upper.includes('PROVINCIA_SLUG = ?') && params[0]) ? params[0] : undefined,
      sector_slug: (upper.includes('SECTOR_SLUG = ?') && params.length >= 2) ? params[1] : ((upper.includes('SECTOR_SLUG = ?') && !upper.includes('PROVINCIA_SLUG = ?') && params[0]) ? params[0] : undefined),
      onlyActive: true,
    });
    return [list, []];
  }

  // 11. Historial de Intereses del Visitante en Base de Datos (pp_visitor_interests)
  if (upper.includes('FROM PP_VISITOR_INTERESTS')) {
    const uid = params[0] || null;
    const list = rr.getVisitorInterests(uid);
    return [list, []];
  }

  if (upper.startsWith('INSERT INTO PP_VISITOR_INTERESTS')) {
    const rec = rr.recordVisitorInterest({
      visitor_id: params[0],
      provincia_slug: params[1],
      sector_slug: params[2],
      post_id: params[3] || null,
    });
    return [{ affectedRows: 1, record: rec }, []];
  }

  // 12. Visitors & Page views (usado por socialsforce tracker y recomendador)
  if (upper.includes('FROM VISITORS') || upper.includes('INTO VISITORS') || upper.includes('PAGE_VIEWS')) {
    return [[], []];
  }

  return [[], []];
}

const smartPool = {
  async query(sql, params = []) {
    if (mysqlOnline !== false) {
      try {
        const res = await rawPool.query(sql, params);
        if (mysqlOnline === null) {
          mysqlOnline = true;
          ensureMySqlSchema().catch(() => {});
        }
        return res;
      } catch (err) {
        mysqlOnline = false;
      }
    }
    return executeLocalQuery(sql, params);
  },
  async execute(sql, params = []) {
    return this.query(sql, params);
  },
  async getConnection() {
    if (mysqlOnline !== false) {
      try {
        return await rawPool.getConnection();
      } catch (e) {
        mysqlOnline = false;
      }
    }
    return {
      query: (sql, params) => this.query(sql, params),
      execute: (sql, params) => this.query(sql, params),
      release: () => {},
    };
  },
};

module.exports = smartPool;
