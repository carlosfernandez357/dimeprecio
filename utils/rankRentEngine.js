// ============================================================================
// DimePrecio.es — Motor de Páginas IA, Anuncios Anónimos, Algoritmos de
// Recomendación/Búsqueda, Matriz 52 Provincias x 30 Sectores y Formularios
// ============================================================================
const fs = require('fs');
const path = require('path');
const { LOCATIONS_SEED, SECTORS_SEED, TIER_BUSINESS_MODELS } = require('./rankRentData');

const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_PATH = path.join(DATA_DIR, 'DimePrecio-store.json');

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 110);
}

// ----------------------------------------------------------------------------
// Semilla inicial limpia: Los artículos y anuncios se leen exclusivamente de MySQL
// ----------------------------------------------------------------------------
function buildInitialPagesAndAds(locations, sectors) {
  return { pages: [], ads: [] };
}

// ----------------------------------------------------------------------------
// Inicialización del almacén persistente de DimePrecio.es
// ----------------------------------------------------------------------------
function buildInitialStore() {
  const locations = LOCATIONS_SEED.map((loc, idx) => ({
    id: idx + 1,
    ...loc,
    activa: true,
  }));

  const sectors = SECTORS_SEED.map((sec, idx) => ({
    id: idx + 1,
    ...sec,
    activo: true,
  }));

  const { pages, ads } = buildInitialPagesAndAds(locations, sectors);

  // Configuración específica de zonas [provincia_slug + sector_slug]
  // Permite gestionar desde Admin todos los sectores de todas las provincias
  const zone_configs = [
    {
      key: 'zaragoza__reformas-integrales-banos-cocinas',
      provincia_slug: 'zaragoza',
      provincia_nombre: 'Zaragoza',
      sector_slug: 'reformas-integrales-banos-cocinas',
      sector_nombre: 'Reformas Integrales y Baños/Cocinas',
      modelo_activo: 'alquiler_zona',
      precio_lead_custom: 85,
      cuota_mensual_custom: 400,
      comision_pct_custom: 12,
      espacio_destacado_cuota: 249,
      whatsapp_automatico: '34600112233',
      etiqueta_anuncio: 'Socio Oficial de DimePrecio.es en Zaragoza para Reformas',
      algoritmo_impulsado: true,
      prioridad_zona: 10,
      activa: true,
      updated_at: new Date().toISOString(),
    },
    {
      key: 'malaga__placas-solares-aerotermia',
      provincia_slug: 'malaga',
      provincia_nombre: 'Málaga',
      sector_slug: 'placas-solares-aerotermia',
      sector_nombre: 'Placas Solares y Aerotermia',
      modelo_activo: 'alquiler_zona',
      precio_lead_custom: 95,
      cuota_mensual_custom: 450,
      comision_pct_custom: 15,
      espacio_destacado_cuota: 299,
      whatsapp_automatico: '34600445566',
      etiqueta_anuncio: 'Socio Oficial de DimePrecio.es en Málaga para Placas Solares',
      algoritmo_impulsado: true,
      prioridad_zona: 10,
      activa: true,
      updated_at: new Date().toISOString(),
    },
    {
      key: 'valencia__reformas-integrales-banos-cocinas',
      provincia_slug: 'valencia',
      provincia_nombre: 'Valencia',
      sector_slug: 'reformas-integrales-banos-cocinas',
      sector_nombre: 'Reformas Integrales y Baños/Cocinas',
      modelo_activo: 'lead_directo',
      precio_lead_custom: 25,
      cuota_mensual_custom: 400,
      comision_pct_custom: 10,
      espacio_destacado_cuota: 199,
      whatsapp_automatico: '',
      etiqueta_anuncio: 'Central DimePrecio.es Valencia — Venta Directa por Contacto',
      algoritmo_impulsado: true,
      prioridad_zona: 10,
      activa: true,
      updated_at: new Date().toISOString(),
    },
    {
      key: 'madrid__tejados-cubiertas-impermeabilizaciones',
      provincia_slug: 'madrid',
      provincia_nombre: 'Madrid',
      sector_slug: 'tejados-cubiertas-impermeabilizaciones',
      sector_nombre: 'Tejados, Cubiertas e Impermeabilizaciones',
      modelo_activo: 'comision_obra',
      precio_lead_custom: 90,
      cuota_mensual_custom: 500,
      comision_pct_custom: 15,
      espacio_destacado_cuota: 299,
      whatsapp_automatico: '',
      etiqueta_anuncio: 'Intermediación de Obra DimePrecio.es Madrid (15% comisión)',
      algoritmo_impulsado: true,
      prioridad_zona: 9,
      activa: true,
      updated_at: new Date().toISOString(),
    },
  ];

  // Formularios personalizados y plantillas subidas por sector / provincia
  const custom_forms = {};
  for (const sec of sectors) {
    custom_forms[sec.slug] = {
      sector_slug: sec.slug,
      sector_nombre: sec.nombre,
      ...sec.formulario_presupuesto,
      plantilla_descargable_url: null,
      plantilla_nombre_archivo: null,
      updated_at: new Date().toISOString(),
    };
  }

  // Solicitudes de presupuesto de demostración (enviadas directamente al Agente en Admin, sin respuesta IA al usuario)
  const quote_requests = [
    {
      id: 1,
      codigo: 'PP-2026-0001',
      provincia_id: 46,
      provincia_slug: 'valencia',
      provincia_nombre: 'Valencia',
      municipio: 'Valencia Centro (Ruzafa)',
      sector_id: 1,
      sector_slug: 'reformas-integrales-banos-cocinas',
      sector_nombre: 'Reformas Integrales y Baños/Cocinas',
      anuncio_id: 5,
      contenido_origen_id: 9,
      origen_titulo: 'Guía de Precios 2026: Cuánto cuesta Reformas Integrales y Baños/Cocinas en Valencia',
      nombre_cliente: 'Carlos Martínez',
      telefono_whatsapp: '654889900',
      email_opcional: 'carlos.m@ejemplo.es',
      campos_formulario_json: {
        tipo_inmueble: 'Vivienda particular / Piso',
        dimension_alcance: 'Baño de 6 m² (cambiar bañera por plato de ducha)',
        plazo_deseado: 'Este mes',
        presupuesto_objetivo_cliente: '1.500 €',
      },
      explicacion_cliente: 'Quiero cambiar la bañera actual de 170x70 por un plato de ducha de resina antideslizante a ras de suelo con mampara fija de cristal y grifería termostática este mismo mes en Valencia centro.',
      archivos_adjuntos: [
        {
          originalName: 'croquis-bano-valencia.pdf',
          filename: 'demo-croquis-bano.pdf',
          url: '/admin/archivos/forms/demo-croquis-bano.pdf',
          size: 145200,
        },
      ],
      modelo_negocio_aplicado: 'lead_directo',
      precio_venta_lead: 25,
      cuota_zona_mensual: 400,
      comision_obra_pct: 10,
      valor_estimado_trabajo: 1500,
      estado_agente: 'nuevo_en_bandeja', // nuevo_en_bandeja | enviado_profesional | desbloqueado_pagado | en_seguimiento_comision
      contacto_desbloqueado: false,
      payment_link: 'https://DimePrecio.es/pago-lead/PP-2026-0001',
      notas_agente: '',
      created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
    {
      id: 2,
      codigo: 'PP-2026-0002',
      provincia_id: 50,
      provincia_slug: 'zaragoza',
      provincia_nombre: 'Zaragoza',
      municipio: 'Zaragoza (Delicias)',
      sector_id: 1,
      sector_slug: 'reformas-integrales-banos-cocinas',
      sector_nombre: 'Reformas Integrales y Baños/Cocinas',
      anuncio_id: 10,
      contenido_origen_id: 17,
      origen_titulo: 'Guía de Precios 2026: Cuánto cuesta Reformas Integrales y Baños/Cocinas en Zaragoza',
      nombre_cliente: 'Laura Gómez',
      telefono_whatsapp: '611223344',
      email_opcional: 'laura.gomez@ejemplo.es',
      campos_formulario_json: {
        tipo_inmueble: 'Vivienda particular / Piso',
        dimension_alcance: 'Reforma integral piso 85 m² (cocina + 2 baños + suelos)',
        plazo_deseado: 'En los próximos 15-30 días',
        presupuesto_objetivo_cliente: '22.000 €',
      },
      explicacion_cliente: 'Hemos comprado un piso en Delicias (Zaragoza) de 85 m² y necesitamos reforma integral de cocina, dos baños, electricidad y tarima AC5. Adjunto plano con medidas.',
      archivos_adjuntos: [],
      modelo_negocio_aplicado: 'alquiler_zona',
      precio_venta_lead: 85,
      cuota_zona_mensual: 400,
      comision_obra_pct: 12,
      valor_estimado_trabajo: 22000,
      estado_agente: 'nuevo_en_bandeja',
      contacto_desbloqueado: true,
      payment_link: '',
      notas_agente: 'Zona alquilada en modalidad Rank & Rent (400 €/mes). Listo para reenviar al socio oficial de Zaragoza.',
      created_at: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    },
    {
      id: 3,
      codigo: 'PP-2026-0003',
      provincia_id: 28,
      provincia_slug: 'madrid',
      provincia_nombre: 'Madrid',
      municipio: 'Pozuelo de Alarcón',
      sector_id: 4,
      sector_slug: 'tejados-cubiertas-impermeabilizaciones',
      sector_nombre: 'Tejados, Cubiertas e Impermeabilizaciones',
      anuncio_id: 3,
      contenido_origen_id: 1,
      origen_titulo: 'Proyectos Llave en Mano de Tejados y Cubiertas en Madrid',
      nombre_cliente: 'Comunidad Prop. Avenida Europa',
      telefono_whatsapp: '699112233',
      email_opcional: 'presidente@comunidad-pozuelo.es',
      campos_formulario_json: {
        tipo_inmueble: 'Comunidad de propietarios',
        dimension_alcance: 'Cubierta inclinada de teja de 260 m² con aislamiento XPS',
        plazo_deseado: 'En los próximos 15-30 días',
        presupuesto_objetivo_cliente: '15.000 €',
      },
      explicacion_cliente: 'Necesitamos rehabilitación completa e impermeabilización de cubierta de 260 m² en nuestra comunidad en Pozuelo. Tenemos aprobada derrama y buscamos presupuesto cerrado.',
      archivos_adjuntos: [],
      modelo_negocio_aplicado: 'comision_obra',
      precio_venta_lead: 95,
      cuota_zona_mensual: 500,
      comision_obra_pct: 15,
      valor_estimado_trabajo: 15000,
      estado_agente: 'en_seguimiento_comision',
      contacto_desbloqueado: true,
      payment_link: '',
      notas_agente: 'Operación a comisión del 15% (15.000 € presupuesto estimado -> 2.250 € comisión DimePrecio.es).',
      created_at: new Date(Date.now() - 1000 * 60 * 260).toISOString(),
    },
  ];

  // Categorías base compatibles con socialsforce
  const categories = [
    { id: 1, name: 'Reformas y Construcción', slug: 'reformas-y-construccion', description: 'Guías de precios y presupuestos de reformas, tejados y rehabilitación en España.', color: '#0f4c81', post_count: 14 },
    { id: 2, name: 'Instalaciones y Energía', slug: 'instalaciones-y-energia', description: 'Placas solares, aerotermia, electricidad, fontanería y climatización.', color: '#0ea5e9', post_count: 12 },
    { id: 3, name: 'Servicios del Hogar', slug: 'servicios-del-hogar', description: 'Cerrajeros, mudanzas, control de plagas, limpieza y jardinería.', color: '#10b981', post_count: 8 },
    { id: 4, name: 'Legal y Empresas', slug: 'legal-y-empresas', description: 'Abogados, asesorías, arquitectura, licencias y digitalización.', color: '#6366f1', post_count: 6 },
    { id: 5, name: 'Salud y Bienestar', slug: 'salud-y-bienestar', description: 'Clínicas dentales, fisioterapia, estética y psicología.', color: '#ec4899', post_count: 6 },
  ];

  const settings = {
    site_name: 'DimePrecio.es',
    site_domain: 'https://DimePrecio.es',
    site_tagline: 'Artículos Especializados y Guías por Sectores y Provincias en España',
    default_author: 'DimePrecio.es',
    algorithm_config: {
      peso_fijados: 65,
      peso_provincia_detectada: 45,
      peso_anuncio_seleccionado: 40,
      peso_afinidad_sector: 30,
      peso_prioridad_manual: 25,
      peso_popularidad: 15,
    },
  };

  return {
    version: 6,
    settings,
    categories,
    locations,
    sectors,
    posts: pages,
    ads,
    zone_configs,
    custom_forms,
    quote_requests,
    schedules: [],
    visitors: [],
    visitor_interests: [],
  };
}

let memoryStore = null;

function loadStore() {
  if (memoryStore) return memoryStore;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
      if (parsed && parsed.version === 6 && Array.isArray(parsed.locations) && parsed.locations.length >= 52) {
        let dirty = false;
        for (const p of parsed.posts || []) {
          if (!p.image || String(p.image).includes('1631545806609')) {
            p.image = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80';
            p.featured_image = p.image;
            dirty = true;
          } else if (!p.featured_image || String(p.featured_image).includes('1631545806609')) {
            p.featured_image = p.image;
            dirty = true;
          }
        }
        memoryStore = parsed;
        if (dirty) saveStore();
        return memoryStore;
      }
    }
  } catch (e) {
    console.error('[DimePrecio Store] Error leyendo store, regenerando:', e.message);
  }
  memoryStore = buildInitialStore();
  saveStore();
  return memoryStore;
}

function syncEntityToDatabase(table, data) {
  try {
    const db = require('../db');
    if (!db || typeof db.query !== 'function') return;

    if (table === 'pp_quote_requests') {
      db.query(
        `INSERT INTO pp_quote_requests 
         (codigo, provincia_slug, provincia_nombre, municipio, sector_slug, sector_nombre, anuncio_id, contenido_origen_id, origen_titulo, nombre_cliente, telefono_whatsapp, email_opcional, campos_formulario_json, explicacion_cliente, archivos_adjuntos_json, modelo_negocio_aplicado, precio_venta_lead, valor_estimado_trabajo, estado_agente, contacto_desbloqueado, payment_link, notas_agente)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE estado_agente = VALUES(estado_agente), notas_agente = VALUES(notas_agente), contacto_desbloqueado = VALUES(contacto_desbloqueado), modelo_negocio_aplicado = VALUES(modelo_negocio_aplicado), precio_venta_lead = VALUES(precio_venta_lead)`,
        [
          data.codigo,
          data.provincia_slug,
          data.provincia_nombre,
          data.municipio,
          data.sector_slug,
          data.sector_nombre,
          data.anuncio_id || null,
          data.contenido_origen_id || null,
          data.origen_titulo,
          data.nombre_cliente,
          data.telefono_whatsapp,
          data.email_opcional,
          JSON.stringify(data.campos_formulario_json || {}),
          data.explicacion_cliente,
          JSON.stringify(data.archivos_adjuntos || []),
          data.modelo_negocio_aplicado,
          data.precio_venta_lead || 35,
          data.valor_estimado_trabajo || 1500,
          data.estado_agente || 'nuevo_en_bandeja',
          data.contacto_desbloqueado ? 1 : 0,
          data.payment_link || '',
          data.notas_agente || ''
        ]
      ).catch(err => {
        // En local silencioso si MySQL no está accesible
      });
    } else if (table === 'pp_ads') {
      db.query(
        `INSERT INTO pp_ads 
         (id, codigo, titulo, subtitulo, badge, sello, cta_texto, marca_visible, es_anonimo, provincia_slug, provincia_nombre, sector_slug, sector_nombre, sector_icono, municipios_cubiertos, fijado, seleccionado, prioridad, activo, impresiones, clics, conversiones)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE titulo=VALUES(titulo), subtitulo=VALUES(subtitulo), cta_texto=VALUES(cta_texto), fijado=VALUES(fijado), seleccionado=VALUES(seleccionado), prioridad=VALUES(prioridad), activo=VALUES(activo), conversiones=VALUES(conversiones)`,
        [
          data.id,
          data.codigo,
          data.titulo,
          data.subtitulo,
          data.badge,
          data.sello,
          data.cta_texto,
          data.marca_visible || 'DimePrecio.es',
          data.es_anonimo !== false ? 1 : 0,
          data.provincia_slug,
          data.provincia_nombre,
          data.sector_slug,
          data.sector_nombre,
          data.sector_icono,
          JSON.stringify(data.municipios_cubiertos || []),
          data.fijado ? 1 : 0,
          data.seleccionado ? 1 : 0,
          data.prioridad || 8,
          data.activo !== false ? 1 : 0,
          data.impresiones || 0,
          data.clics || 0,
          data.conversiones || 0
        ]
      ).catch(() => {});
    } else if (table === 'pp_sector_forms') {
      db.query(
        `INSERT INTO pp_sector_forms
         (form_key, sector_slug, sector_nombre, provincia_slug, titulo, titulo_formulario, explicacion_cliente, instrucciones_cliente, explicacion_label, explicacion_placeholder, calculadora_json, campos_json, permitir_adjuntos, formatos_admitidos)
         VALUES (?, ?, ?, 'todas', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE titulo=VALUES(titulo), titulo_formulario=VALUES(titulo_formulario), explicacion_cliente=VALUES(explicacion_cliente), instrucciones_cliente=VALUES(instrucciones_cliente), calculadora_json=VALUES(calculadora_json), campos_json=VALUES(campos_json), permitir_adjuntos=VALUES(permitir_adjuntos)`,
        [
          `${data.sector_slug}__todas`,
          data.sector_slug,
          data.sector_nombre,
          data.titulo,
          data.titulo_formulario,
          data.explicacion_cliente,
          data.instrucciones_cliente,
          data.explicacion_label,
          data.explicacion_placeholder,
          JSON.stringify(data.calculadora_json || {}),
          JSON.stringify({ campos: data.campos || [], campos_personalizados: data.campos_personalizados || [] }),
          data.permitir_adjuntos !== false ? 1 : 0,
          data.formatos_admitidos || ''
        ]
      ).catch(() => {});
    } else if (table === 'pp_visitor_interests') {
      db.query(
        `INSERT INTO pp_visitor_interests (visitor_id, provincia_slug, sector_slug, last_post_id, hits)
         VALUES (?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE hits = hits + 1`,
        [data.visitor_id, data.provincia_slug, data.sector_slug, data.last_post_id || null]
      ).catch(() => {});
    }
  } catch (e) {
    // Protección contra excepciones
  }
}

function saveStore() {
  // Desactivado: El almacenamiento ahora se realiza directamente en MySQL
}

// ----------------------------------------------------------------------------
// Sincronización limpia desde MySQL (posts reales, anuncios reales, etc.)
// ----------------------------------------------------------------------------
async function syncFromDatabase() {
  try {
    const db = require('../db');
    if (!db || typeof db.query !== 'function') return;

    const s = loadStore();

    // 1. Sincronizar artículos reales desde MySQL
    const [postRows] = await db.query("SELECT * FROM posts WHERE status = 'published' ORDER BY views DESC");
    if (Array.isArray(postRows)) {
      s.posts = postRows.map(p => ({
        ...p,
        image: p.featured_image || p.image || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=900&q=80',
        featured_image: p.featured_image || p.image || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=900&q=80',
        category: p.sector_nombre ? `${p.provincia_nombre || 'España'} · ${p.sector_nombre}` : (p.category_name || 'DimePrecio.es'),
        category_name: p.sector_nombre || p.category_name || 'DimePrecio.es',
        category_slug: p.sector_slug || p.category_slug || 'servicios',
      }));
    }

    // 2. Sincronizar anuncios reales desde MySQL
    const [adRows] = await db.query("SELECT * FROM pp_ads WHERE activo = 1 ORDER BY fijado DESC, prioridad DESC");
    if (Array.isArray(adRows)) {
      s.ads = adRows.map(a => {
        let mun = [];
        if (typeof a.municipios_cubiertos === 'string') {
          try { mun = JSON.parse(a.municipios_cubiertos); } catch (e) { mun = [a.provincia_nombre || '']; }
        } else if (Array.isArray(a.municipios_cubiertos)) {
          mun = a.municipios_cubiertos;
        }
        return {
          ...a,
          municipios_cubiertos: mun,
          fijado: Boolean(a.fijado),
          seleccionado: Boolean(a.seleccionado),
          activo: Boolean(a.activo),
        };
      });
    }

    // 3. Sincronizar provincias reales desde MySQL
    const [locRows] = await db.query("SELECT * FROM pp_locations ORDER BY id ASC, nombre ASC");
    if (Array.isArray(locRows) && locRows.length > 0) {
      s.locations = locRows.map(l => {
        let mun = [];
        if (typeof l.municipios === 'string') {
          try { mun = JSON.parse(l.municipios); } catch (e) { mun = [l.nombre]; }
        } else if (Array.isArray(l.municipios)) {
          mun = l.municipios;
        }
        return {
          ...l,
          municipios: mun,
          activa: Boolean(l.activa),
        };
      });
    }

    // 4. Sincronizar sectores reales desde MySQL
    const [secRows] = await db.query("SELECT * FROM pp_sectors ORDER BY id ASC, nombre ASC");
    if (Array.isArray(secRows) && secRows.length > 0) {
      s.sectors = secRows.map(sec => {
        let kw = [];
        if (typeof sec.keywords === 'string') {
          try { kw = JSON.parse(sec.keywords); } catch (e) { kw = []; }
        } else if (Array.isArray(sec.keywords)) {
          kw = sec.keywords;
        }
        let form = {};
        if (typeof sec.formula_precio_base_json === 'string') {
          try { form = JSON.parse(sec.formula_precio_base_json); } catch (e) { form = {}; }
        } else if (typeof sec.formula_precio_base_json === 'object') {
          form = sec.formula_precio_base_json;
        }
        return {
          ...sec,
          keywords: kw,
          formula_precio_base_json: form,
          activo: Boolean(sec.activo),
        };
      });
    }
  } catch (err) {
    console.error('[rankRentEngine] Error syncing from database:', err.message);
  }
}

// ----------------------------------------------------------------------------
// Consultas de Provincias (52) y Sectores (30+)
// ----------------------------------------------------------------------------
function getLocations(onlyActive = false) {
  const s = loadStore();
  return onlyActive ? s.locations.filter(l => l.activa !== false) : s.locations;
}

function getLocationBySlug(slug) {
  if (!slug) return null;
  const s = loadStore();
  const clean = String(slug).toLowerCase().trim();
  return (
    s.locations.find(l => l.slug === clean) ||
    s.locations.find(l => l.slug.startsWith(clean) || clean.startsWith(l.slug)) ||
    null
  );
}

function getLocationById(id) {
  const s = loadStore();
  return s.locations.find(l => Number(l.id) === Number(id)) || null;
}

function getSectors(onlyActive = false) {
  const s = loadStore();
  return onlyActive ? s.sectors.filter(sec => sec.activo !== false) : s.sectors;
}

function getSectorBySlug(slug) {
  if (!slug) return null;
  const s = loadStore();
  const clean = String(slug).toLowerCase().trim();
  return (
    s.sectors.find(sec => sec.slug === clean) ||
    s.sectors.find(sec => sec.slug.startsWith(clean) || clean.startsWith(sec.slug)) ||
    s.sectors.find(sec => clean.split('-')[0] && sec.slug.startsWith(clean.split('-')[0])) ||
    null
  );
}

function getSectorById(id) {
  const s = loadStore();
  return s.sectors.find(sec => Number(sec.id) === Number(id)) || null;
}

function addSector(payload) {
  const s = loadStore();
  const nombre = String(payload.nombre || '').trim();
  if (!nombre) throw new Error('El nombre del sector es obligatorio');
  const slug = payload.slug ? slugify(payload.slug) : slugify(nombre);
  const existing = s.sectors.find(x => x.slug === slug);
  if (existing) return existing;

  const tier = payload.tier && TIER_BUSINESS_MODELS[payload.tier] ? payload.tier : 'medio';
  const tierConfig = TIER_BUSINESS_MODELS[tier];
  const newId = s.sectors.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;

  const newSector = {
    id: newId,
    slug,
    nombre,
    icono: payload.icono || '🛠️',
    categoria_padre: payload.categoria_padre || 'Hogar y Obras',
    tier,
    keywords: Array.isArray(payload.keywords)
      ? payload.keywords
      : String(payload.keywords || nombre.toLowerCase()).split(',').map(k => k.trim()).filter(Boolean),
    formula_precio_base_json: {
      min: Number(payload.precio_min) || 150,
      max: Number(payload.precio_max) || 2500,
      unidad: payload.unidad || 'servicio completo',
    },
    precios_negocio: {
      lead_min: Number(payload.lead_min) || tierConfig.lead_min,
      lead_max: Number(payload.lead_max) || tierConfig.lead_max,
      lead_recomendado: Number(payload.lead_recomendado) || tierConfig.lead_recomendado,
      alquiler_mensual_zona: Number(payload.alquiler_mensual_zona) || tierConfig.alquiler_mensual_zona,
      comision_obra_pct: Number(payload.comision_obra_pct) || tierConfig.comision_obra_pct,
      espacio_destacado_mes: Number(payload.espacio_destacado_mes) || tierConfig.espacio_destacado_mes,
      ticket_medio_obra: Number(payload.ticket_medio_obra) || tierConfig.ticket_medio_obra,
    },
    formulario_presupuesto: {
      titulo_formulario: payload.titulo_formulario || `Solicitar Presupuesto Oficial de ${nombre}`,
      instrucciones_cliente:
        payload.instrucciones_cliente ||
        `Describe con detalle qué trabajo de ${nombre.toLowerCase()} necesitas, medidas aproximadas y plazos. Puedes adjuntar fotos, planos o un presupuesto previo para que el agente de DimePrecio.es lo tramite en tu provincia.`,
      permitir_adjuntos: true,
      formatos_admitidos: '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx',
      campos: [
        {
          name: 'tipo_inmueble',
          label: 'Tipo de inmueble o cliente',
          type: 'select',
          required: true,
          options: ['Vivienda particular / Piso', 'Chalet / Vivienda unifamiliar', 'Local comercial / Oficina', 'Comunidad de propietarios', 'Empresa / Industrial'],
        },
        {
          name: 'dimension_alcance',
          label: 'Medidas aproximadas, superficie o unidades',
          type: 'text',
          required: true,
          placeholder: 'Ej: 45 m², 1 vivienda completa, urgencia puntual...',
        },
        {
          name: 'plazo_deseado',
          label: '¿Para cuándo necesitas el servicio?',
          type: 'select',
          required: true,
          options: ['Urgente (esta semana)', 'Este mes', 'En los próximos 1-2 meses', 'Estoy comparando presupuestos'],
        },
        {
          name: 'presupuesto_objetivo_cliente',
          label: 'Presupuesto estimado que tienes en mente (€ opcional)',
          type: 'text',
          required: false,
          placeholder: 'Ej: 1.500 €',
        },
      ],
      explicacion_label: 'Explicación detallada del trabajo que necesitas para tu presupuesto',
      explicacion_placeholder: `Explica aquí todos los detalles de tu solicitud de ${nombre.toLowerCase()} (estado actual, materiales deseados, barrio o municipio exacto...). Esta información llega directamente al agente de DimePrecio.es.`,
    },
    activo: true,
  };

  s.sectors.push(newSector);
  s.custom_forms[slug] = {
    sector_slug: slug,
    sector_nombre: nombre,
    ...newSector.formulario_presupuesto,
    plantilla_descargable_url: null,
    plantilla_nombre_archivo: null,
    updated_at: new Date().toISOString(),
  };

  saveStore();
  return newSector;
}

function updateSector(sectorSlug, payload) {
  const s = loadStore();
  const sec = s.sectors.find(x => x.slug === sectorSlug);
  if (!sec) return null;

  if (payload.nombre) sec.nombre = String(payload.nombre).trim();
  if (payload.icono) sec.icono = String(payload.icono).trim();
  if (payload.categoria_padre) sec.categoria_padre = String(payload.categoria_padre).trim();
  if (payload.activo !== undefined) sec.activo = Boolean(payload.activo === true || payload.activo === 'true' || payload.activo === '1' || payload.activo === 1);

  if (payload.precio_min !== undefined || payload.precio_max !== undefined || payload.unidad !== undefined) {
    sec.formula_precio_base_json = {
      min: Number(payload.precio_min ?? sec.formula_precio_base_json?.min ?? 100),
      max: Number(payload.precio_max ?? sec.formula_precio_base_json?.max ?? 1500),
      unidad: String(payload.unidad || sec.formula_precio_base_json?.unidad || 'servicio'),
    };
  }

  sec.precios_negocio = {
    ...sec.precios_negocio,
    lead_min: Number(payload.lead_min ?? sec.precios_negocio?.lead_min ?? 20),
    lead_max: Number(payload.lead_max ?? sec.precios_negocio?.lead_max ?? 50),
    lead_recomendado: Number(payload.lead_recomendado ?? sec.precios_negocio?.lead_recomendado ?? 35),
    alquiler_mensual_zona: Number(payload.alquiler_mensual_zona ?? sec.precios_negocio?.alquiler_mensual_zona ?? 400),
    comision_obra_pct: Number(payload.comision_obra_pct ?? sec.precios_negocio?.comision_obra_pct ?? 12),
    espacio_destacado_mes: Number(payload.espacio_destacado_mes ?? sec.precios_negocio?.espacio_destacado_mes ?? 199),
    ticket_medio_obra: Number(payload.ticket_medio_obra ?? sec.precios_negocio?.ticket_medio_obra ?? 3500),
  };

  if (payload.keywords !== undefined) {
    sec.keywords = Array.isArray(payload.keywords)
      ? payload.keywords
      : String(payload.keywords).split(',').map(k => k.trim()).filter(Boolean);
  }

  saveStore();
  syncEntityToDatabase('pp_sector_forms', sec);
  return sec;
}

// ----------------------------------------------------------------------------
// Gestión de la Matriz 52 Provincias x 30+ Sectores (`zone_configs`)
// ----------------------------------------------------------------------------
function getZoneKey(provinciaSlug, sectorSlug) {
  return `${provinciaSlug || 'todas'}__${sectorSlug || 'todos'}`;
}

function getZoneConfig(provinciaSlug, sectorSlug) {
  const s = loadStore();
  const key = getZoneKey(provinciaSlug, sectorSlug);
  const found = (s.zone_configs || []).find(z => z.key === key);
  const prov = getLocationBySlug(provinciaSlug);
  const sec = getSectorBySlug(sectorSlug);

  if (found) return found;

  return {
    key,
    provincia_slug: provinciaSlug,
    provincia_nombre: prov ? prov.nombre : 'Toda España',
    sector_slug: sectorSlug,
    sector_nombre: sec ? sec.nombre : 'Todos los sectores',
    modelo_activo: 'lead_directo',
    precio_lead_custom: sec?.precios_negocio?.lead_recomendado || 35,
    cuota_mensual_custom: sec?.precios_negocio?.alquiler_mensual_zona || 400,
    comision_pct_custom: sec?.precios_negocio?.comision_obra_pct || 12,
    espacio_destacado_cuota: sec?.precios_negocio?.espacio_destacado_mes || 199,
    whatsapp_automatico: '',
    etiqueta_anuncio: `Servicio Oficial DimePrecio.es — ${sec ? sec.nombre : 'Presupuestos'} en ${prov ? prov.nombre : 'España'}`,
    algoritmo_impulsado: false,
    prioridad_zona: 5,
    activa: true,
  };
}

function upsertZoneConfig(payload) {
  const s = loadStore();
  if (!Array.isArray(s.zone_configs)) s.zone_configs = [];
  const prov = getLocationBySlug(payload.provincia_slug);
  const sec = getSectorBySlug(payload.sector_slug);
  const key = getZoneKey(payload.provincia_slug, payload.sector_slug);

  const existingIdx = s.zone_configs.findIndex(z => z.key === key);
  const record = {
    key,
    provincia_slug: payload.provincia_slug,
    provincia_nombre: prov ? prov.nombre : payload.provincia_slug,
    sector_slug: payload.sector_slug,
    sector_nombre: sec ? sec.nombre : payload.sector_slug,
    modelo_activo: payload.modelo_activo || 'lead_directo',
    precio_lead_custom: Number(payload.precio_lead_custom ?? sec?.precios_negocio?.lead_recomendado ?? 35),
    cuota_mensual_custom: Number(payload.cuota_mensual_custom ?? sec?.precios_negocio?.alquiler_mensual_zona ?? 400),
    comision_pct_custom: Number(payload.comision_pct_custom ?? sec?.precios_negocio?.comision_obra_pct ?? 12),
    espacio_destacado_cuota: Number(payload.espacio_destacado_cuota ?? sec?.precios_negocio?.espacio_destacado_mes ?? 199),
    whatsapp_automatico: String(payload.whatsapp_automatico || '').replace(/[^0-9+]/g, ''),
    etiqueta_anuncio: String(payload.etiqueta_anuncio || `DimePrecio.es Oficial · ${sec ? sec.nombre : ''} en ${prov ? prov.nombre : ''}`).trim(),
    algoritmo_impulsado: Boolean(payload.algoritmo_impulsado === true || payload.algoritmo_impulsado === 'true' || payload.algoritmo_impulsado === '1' || payload.algoritmo_impulsado === 'on'),
    prioridad_zona: Math.max(1, Math.min(10, Number(payload.prioridad_zona) || 7)),
    activa: payload.activa === undefined ? true : Boolean(payload.activa === true || payload.activa === 'true' || payload.activa === '1' || payload.activa === 'on'),
    updated_at: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    s.zone_configs[existingIdx] = record;
  } else {
    s.zone_configs.push(record);
  }
  saveStore();
  return record;
}

function getAllZoneConfigs(filters = {}) {
  const s = loadStore();
  let list = [...(s.zone_configs || [])];
  if (filters.provincia_slug) list = list.filter(z => z.provincia_slug === filters.provincia_slug);
  if (filters.sector_slug) list = list.filter(z => z.sector_slug === filters.sector_slug);
  if (filters.modelo_activo) list = list.filter(z => z.modelo_activo === filters.modelo_activo);
  return list;
}

// ----------------------------------------------------------------------------
// Gestión de Anuncios Anónimos de DimePrecio.es y Algoritmo de Selección
// ----------------------------------------------------------------------------
function getAds(filters = {}) {
  const s = loadStore();
  let list = [...(s.ads || [])];

  if (filters.onlyActive !== false) {
    list = list.filter(a => a.activo !== false);
  }
  if (filters.provincia_slug) {
    list = list.filter(a => a.provincia_slug === filters.provincia_slug || a.provincia_slug === 'todas');
  }
  if (filters.sector_slug) {
    list = list.filter(a => a.sector_slug === filters.sector_slug || a.sector_slug === 'todos');
  }
  if (filters.modelo_negocio) {
    list = list.filter(a => a.modelo_negocio === filters.modelo_negocio);
  }
  if (filters.onlySelected) {
    list = list.filter(a => a.seleccionado === true);
  }

  return list.sort((a, b) => {
    if ((b.seleccionado ? 1 : 0) !== (a.seleccionado ? 1 : 0)) {
      return (b.seleccionado ? 1 : 0) - (a.seleccionado ? 1 : 0);
    }
    return (Number(b.prioridad) || 5) - (Number(a.prioridad) || 5);
  });
}

/**
 * Algoritmo de recomendación de Anuncios de DimePrecio.es
 * Ordena según:
 * 1) Seleccionados por Admin (`seleccionado: true`) + `prioridad` (1..10)
 * 2) Coincidencia con la provincia detectada del visitante (`provincia_slug`)
 * 3) Coincidencia con el sector actual o afinidad de búsqueda del usuario (`sector_slug`)
 * 4) Impulso de la zona configurada en la matriz (`algoritmo_impulsado`)
 */
function getRecommendedAds({ provinciaSlug = null, sectorSlug = null, preferredSectors = [], limit = 6 } = {}) {
  const s = loadStore();
  const cfg = s.settings?.algorithm_config || {
    peso_provincia_detectada: 45,
    peso_anuncio_seleccionado: 35,
    peso_afinidad_sector: 25,
    peso_prioridad_manual: 20,
    peso_popularidad: 10,
  };

  const activeAds = (s.ads || []).filter(a => a.activo !== false);
  const scored = activeAds.map(ad => {
    let score = 0;

    // 0. Anuncio fijado arriba (Pinned)
    if (ad.fijado) {
      score += Number(cfg.peso_fijados) || 65;
    }

    // 1. Anuncio marcado como "Seleccionado / Recomendado" en el panel de admin
    if (ad.seleccionado) {
      score += Number(cfg.peso_anuncio_seleccionado) || 35;
    }

    // 2. Coincidencia con la provincia detectada o navegada
    if (provinciaSlug && ad.provincia_slug === provinciaSlug) {
      score += Number(cfg.peso_provincia_detectada) || 45;
    } else if (ad.provincia_slug === 'todas') {
      score += 18;
    }

    // 3. Coincidencia con el sector actual o sectores buscados por el usuario
    if (sectorSlug && ad.sector_slug === sectorSlug) {
      score += (Number(cfg.peso_afinidad_sector) || 25) * 1.5;
    } else if (Array.isArray(preferredSectors) && preferredSectors.includes(ad.sector_slug)) {
      score += Number(cfg.peso_afinidad_sector) || 25;
    }

    // 4. Prioridad manual del anuncio (1-10)
    score += ((Number(ad.prioridad) || 5) / 10) * (Number(cfg.peso_prioridad_manual) || 20);

    // 5. Impulso adicional si la zona [provincia + sector] está marcada como impulsada
    const zone = (s.zone_configs || []).find(
      z => z.provincia_slug === ad.provincia_slug && z.sector_slug === ad.sector_slug
    );
    if (zone && zone.algoritmo_impulsado) {
      score += 18;
    }

    // Bonus para Espacios Destacados / Especialista Oficial de Provincia y Zonas Rank & Rent
    if (ad.modelo_negocio === 'espacio_destacado') score += 8;
    if (ad.modelo_negocio === 'alquiler_zona') score += 6;

    return { ...ad, _algo_score: Math.round(score * 10) / 10 };
  });

  scored.sort((a, b) => b._algo_score - a._algo_score);
  return scored.slice(0, limit);
}

function createOrUpdateAd(payload) {
  const s = loadStore();
  if (!Array.isArray(s.ads)) s.ads = [];

  const prov = getLocationBySlug(payload.provincia_slug);
  const sec = getSectorBySlug(payload.sector_slug);
  const id = payload.id ? Number(payload.id) : null;
  const existingIdx = id ? s.ads.findIndex(a => Number(a.id) === id) : -1;

  const newId = existingIdx >= 0 ? id : s.ads.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;
  const modelo = payload.modelo_negocio || 'lead_directo';

  const record = {
    id: newId,
    codigo: payload.codigo || `PP-AD-${(prov?.slug || 'ESP').toUpperCase()}-${String(newId).padStart(2, '0')}`,
    titulo: String(payload.titulo || `Presupuesto Oficial de ${sec ? sec.nombre : 'Servicios'} en ${prov ? prov.nombre : 'España'}`).trim(),
    subtitulo: String(
      payload.subtitulo ||
        `Servicio gestionado por DimePrecio.es en ${prov ? prov.nombre : 'toda España'}. Solicita presupuesto personalizado adjuntando los detalles de tu trabajo.`
    ).trim(),
    badge: String(payload.badge || `Anuncio Oficial DimePrecio.es · ${prov ? prov.nombre : 'Nacional'}`).trim(),
    sello: String(payload.sello || (modelo === 'espacio_destacado' ? `⭐ Empresa Nº1 Recomendada en ${prov ? prov.nombre : 'la Provincia'}` : `Verificado DimePrecio.es`)).trim(),
    cta_texto: String(payload.cta_texto || 'Solicitar Presupuesto Ahora').trim(),
    marca_visible: String(payload.marca_visible || 'DimePrecio.es — Central Oficial de Presupuestos').trim(),
    es_anonimo: true,
    provincia_id: prov ? prov.id : null,
    provincia_slug: prov ? prov.slug : payload.provincia_slug || 'todas',
    provincia_nombre: prov ? prov.nombre : 'Toda España',
    sector_id: sec ? sec.id : null,
    sector_slug: sec ? sec.slug : payload.sector_slug || 'todos',
    sector_nombre: sec ? sec.nombre : 'Todos los sectores',
    sector_icono: sec ? sec.icono : '📋',
    municipios_cubiertos: payload.municipios_cubiertos
      ? Array.isArray(payload.municipios_cubiertos)
        ? payload.municipios_cubiertos
        : String(payload.municipios_cubiertos).split(',').map(x => x.trim()).filter(Boolean)
      : (prov?.municipios || []).slice(0, 4),
    modelo_negocio: modelo,
    precio_lead: Number(payload.precio_lead ?? sec?.precios_negocio?.lead_recomendado ?? 35),
    rango_lead_min: Number(payload.rango_lead_min ?? sec?.precios_negocio?.lead_min ?? 20),
    rango_lead_max: Number(payload.rango_lead_max ?? sec?.precios_negocio?.lead_max ?? 50),
    cuota_mensual: Number(payload.cuota_mensual ?? (modelo === 'espacio_destacado' ? 199 : 400)),
    comision_pct: Number(payload.comision_pct ?? sec?.precios_negocio?.comision_obra_pct ?? 12),
    whatsapp_destino: String(payload.whatsapp_destino || '').replace(/[^0-9+]/g, ''),
    payment_link: String(payload.payment_link || 'https://DimePrecio.es/pago-contacto').trim(),
    fijado: Boolean(payload.fijado === true || payload.fijado === 'true' || payload.fijado === '1' || payload.fijado === 'on'),
    seleccionado: Boolean(payload.seleccionado === true || payload.seleccionado === 'true' || payload.seleccionado === '1' || payload.seleccionado === 'on'),
    prioridad: Math.max(1, Math.min(10, Number(payload.prioridad) || 8)),
    activo: payload.activo === undefined ? true : Boolean(payload.activo === true || payload.activo === 'true' || payload.activo === '1' || payload.activo === 'on'),
    impresiones: existingIdx >= 0 ? s.ads[existingIdx].impresiones : 120,
    clics: existingIdx >= 0 ? s.ads[existingIdx].clics : 15,
    conversiones: existingIdx >= 0 ? s.ads[existingIdx].conversiones : 3,
    created_at: existingIdx >= 0 ? s.ads[existingIdx].created_at : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    s.ads[existingIdx] = record;
  } else {
    s.ads.unshift(record);
  }
  saveStore();
  return record;
}

function toggleAdStatus(adId, field = 'seleccionado') {
  const s = loadStore();
  const ad = (s.ads || []).find(a => Number(a.id) === Number(adId));
  if (!ad) return null;
  if (field === 'fijado') ad.fijado = !ad.fijado;
  if (field === 'seleccionado') ad.seleccionado = !ad.seleccionado;
  if (field === 'activo') ad.activo = !ad.activo;
  saveStore();
  syncEntityToDatabase('pp_ads', ad);
  return ad;
}

function togglePostFlag(postId, field = 'is_selected') {
  const s = loadStore();
  const post = (s.posts || []).find(p => Number(p.id) === Number(postId));
  if (!post) return null;
  if (field === 'is_pinned') post.is_pinned = post.is_pinned ? 0 : 1;
  else if (field === 'is_selected') post.is_selected = post.is_selected ? 0 : 1;
  else if (field === 'is_featured') post.is_featured = post.is_featured ? 0 : 1;
  saveStore();
  return post;
}

function updatePostAlgorithmSettings(postId, payload = {}) {
  const s = loadStore();
  const post = (s.posts || []).find(p => Number(p.id) === Number(postId));
  if (!post) return null;

  if (payload.is_pinned !== undefined) {
    post.is_pinned = (payload.is_pinned === true || payload.is_pinned === '1' || payload.is_pinned === 1 || payload.is_pinned === 'on') ? 1 : 0;
  }
  if (payload.is_selected !== undefined) {
    post.is_selected = (payload.is_selected === true || payload.is_selected === '1' || payload.is_selected === 1 || payload.is_selected === 'on') ? 1 : 0;
  }
  if (payload.priority_weight !== undefined) {
    post.priority_weight = Math.max(1, Math.min(10, Number(payload.priority_weight) || 7));
  }
  if (payload.provincia_slug) {
    const prov = getLocationBySlug(payload.provincia_slug);
    if (prov) {
      post.provincia_id = prov.id;
      post.provincia_slug = prov.slug;
      post.provincia_nombre = prov.nombre;
    }
  }
  if (payload.sector_slug) {
    const sec = getSectorBySlug(payload.sector_slug);
    if (sec) {
      post.sector_id = sec.id;
      post.sector_slug = sec.slug;
      post.sector_nombre = sec.nombre;
      post.sector_icono = sec.icono;
      post.category = sec.nombre;
      post.category_name = sec.nombre;
      post.category_slug = sec.slug;
    }
  }
  saveStore();
  return post;
}

/**
 * Malla de Interconexión SEO Automática (Internal Linking Mesh)
 * Conecta cada artículo y página de sector con:
 * 1) Otros artículos del mismo sector y provincia (o del mismo sector en provincias cercanas)
 * 2) Artículos de la misma provincia en sectores complementarios
 * 3) Sectores relacionados en la misma provincia (enlaces hacia /:provinciaSlug/:sectorSlug)
 * 4) Otras provincias principales para el mismo sector (cluster nacional del sector)
 */
function getSeoInterlinks({ postId = null, provinciaSlug = 'madrid', sectorSlug = 'reformas-integrales' } = {}) {
  const s = loadStore();
  const prov = getLocationBySlug(provinciaSlug) || s.locations[0];
  const sec = getSectorBySlug(sectorSlug) || s.sectors[0];
  const allPublished = (s.posts || []).filter(p => p.status === 'published' && Number(p.id) !== Number(postId));

  // 1. Artículos del mismo sector en la misma provincia (o mismo sector si hay pocos)
  const sameSectorProvincePosts = allPublished
    .filter(p => p.sector_slug === sec.slug && p.provincia_slug === prov.slug)
    .concat(allPublished.filter(p => p.sector_slug === sec.slug && p.provincia_slug !== prov.slug))
    .slice(0, 6);

  // 2. Artículos de otros sectores en la misma provincia (refuerza autoridad local de la provincia)
  const sameProvinceOtherSectorPosts = allPublished
    .filter(p => p.provincia_slug === prov.slug && p.sector_slug !== sec.slug)
    .sort((a, b) => ((b.is_pinned ? 10 : 0) + (b.is_selected ? 5 : 0)) - ((a.is_pinned ? 10 : 0) + (a.is_selected ? 5 : 0)))
    .slice(0, 6);

  // 3. Sectores relacionados en esta misma provincia
  const relatedSectorsInProvince = (s.sectors || [])
    .filter(item => item.activo !== false && item.slug !== sec.slug)
    .sort((a, b) => (a.categoria_padre === sec.categoria_padre ? -1 : 1) - (b.categoria_padre === sec.categoria_padre ? -1 : 1))
    .slice(0, 8)
    .map(item => ({
      ...item,
      url: `/${prov.slug}/${item.slug}`,
      anchorText: `${item.nombre} en ${prov.nombre}`,
    }));

  // 4. El mismo sector en otras provincias principales (cluster nacional SEO)
  const topProvSlugs = ['madrid', 'barcelona', 'valencia', 'sevilla', 'zaragoza', 'malaga', 'alicante', 'vizcaya', 'murcia', 'a-coruna'];
  const sameSectorOtherProvinces = (s.locations || [])
    .filter(l => topProvSlugs.includes(l.slug) && l.slug !== prov.slug)
    .slice(0, 8)
    .map(l => ({
      ...l,
      url: `/${l.slug}/${sec.slug}`,
      anchorText: `${sec.nombre} en ${l.nombre}`,
    }));

  return {
    province: prov,
    sector: sec,
    sameSectorProvincePosts,
    sameProvinceOtherSectorPosts,
    relatedSectorsInProvince,
    sameSectorOtherProvinces,
  };
}

function deleteAd(adId) {
  const s = loadStore();
  const prevLen = (s.ads || []).length;
  s.ads = (s.ads || []).filter(a => Number(a.id) !== Number(adId));
  saveStore();
  return s.ads.length < prevLen;
}

// ----------------------------------------------------------------------------
// Formularios de Base de Datos con Calculadores Interactivos por Sector
// ----------------------------------------------------------------------------
function getCustomForm(sectorSlug, provinciaSlug = null) {
  const s = loadStore();
  const sec = getSectorBySlug(sectorSlug) || s.sectors[0];
  const prov = getLocationBySlug(provinciaSlug);

  // Primero buscar si existe formulario específico para [provincia + sector] en la BD
  const specificKey = provinciaSlug ? `${provinciaSlug}__${sec.slug}` : null;
  const baseForm =
    (specificKey && s.custom_forms && s.custom_forms[specificKey]) ||
    (s.custom_forms && s.custom_forms[sec.slug]) ||
    sec.formulario_presupuesto;

  const defaultCalc = sec.formulario_presupuesto?.calculadora_json || {
    activa: true,
    tipo: 'alcance_general',
    titulo: `${sec.icono || '📋'} Configurador Rápido de ${sec.nombre}`,
    descripcion: `Configura los detalles técnicos de ${sec.nombre.toLowerCase()} antes de enviar tu solicitud:`,
    campos_calculadora: [],
  };

  return {
    sector_slug: sec.slug,
    sector_nombre: sec.nombre,
    sector_icono: sec.icono,
    provincia_slug: prov ? prov.slug : null,
    provincia_nombre: prov ? prov.nombre : 'tu provincia',
    titulo_formulario: baseForm?.titulo_formulario || `Solicitar Presupuesto Oficial de ${sec.nombre}`,
    instrucciones_cliente:
      baseForm?.instrucciones_cliente ||
      `Completa los datos específicos de ${sec.nombre.toLowerCase()}. La configuración de la calculadora y tu explicación llegan directamente a nuestro agente en el panel de administración.`,
    permitir_adjuntos: baseForm?.permitir_adjuntos !== false,
    formatos_admitidos: baseForm?.formatos_admitidos || '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx',
    calculadora_json: baseForm?.calculadora_json || defaultCalc,
    campos: Array.isArray(baseForm?.campos) && baseForm.campos.length > 0 ? baseForm.campos : sec.formulario_presupuesto.campos,
    explicacion_label: baseForm?.explicacion_label || 'Explicación detallada para el presupuesto (medidas, situación actual, plazos)',
    explicacion_placeholder:
      baseForm?.explicacion_placeholder ||
      `Escribe aquí toda la explicación de lo que necesitas para tu presupuesto de ${sec.nombre.toLowerCase()}...`,
  };
}

function saveCustomForm(payload) {
  const s = loadStore();
  if (!s.custom_forms) s.custom_forms = {};
  const sec = getSectorBySlug(payload.sector_slug);
  if (!sec) throw new Error('Sector no encontrado');

  const key = payload.provincia_slug && payload.provincia_slug !== 'todas'
    ? `${payload.provincia_slug}__${sec.slug}`
    : sec.slug;

  const current = s.custom_forms[key] || s.custom_forms[sec.slug] || sec.formulario_presupuesto || {};
  let parsedCampos = current.campos || [];

  if (payload.campos_json) {
    try {
      parsedCampos = typeof payload.campos_json === 'string' ? JSON.parse(payload.campos_json) : payload.campos_json;
    } catch (e) {}
  } else if (payload.campos_lineas) {
    const lines = String(payload.campos_lineas)
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);
    if (lines.length > 0) {
      parsedCampos = lines.map((line, idx) => {
        const parts = line.split('|').map(p => p.trim());
        const label = parts[0] || `Pregunta ${idx + 1}`;
        const type = (parts[1] || 'text').toLowerCase();
        const opts = parts[2] ? parts[2].split(',').map(o => o.trim()).filter(Boolean) : [];
        return {
          name: slugify(label).replace(/-/g, '_') || `campo_${idx + 1}`,
          label,
          type: type === 'select' && opts.length > 0 ? 'select' : type === 'number' ? 'number' : 'text',
          required: true,
          options: opts,
          placeholder: parts[2] && type !== 'select' ? parts[2] : '',
        };
      });
    }
  }

  const currentCalc = current.calculadora_json || sec.formulario_presupuesto?.calculadora_json || {
    activa: true,
    tipo: sec.slug === 'climatizacion-aire-acondicionado' ? 'frigorias' : 'alcance_general',
    titulo: `${sec.icono || '📋'} Calculador de ${sec.nombre}`,
    descripcion: '',
    campos_calculadora: [],
  };

  let updatedCalc = { ...currentCalc };
  if (payload.calculadora_json && typeof payload.calculadora_json === 'object') {
    updatedCalc = { ...currentCalc, ...payload.calculadora_json };
  } else {
    if (payload.calculadora_activa !== undefined) {
      updatedCalc.activa = Boolean(
        payload.calculadora_activa === true ||
        payload.calculadora_activa === 'true' ||
        payload.calculadora_activa === '1' ||
        payload.calculadora_activa === 'on'
      );
    }
    if (payload.calculadora_tipo) updatedCalc.tipo = String(payload.calculadora_tipo).trim();
    if (payload.calculadora_titulo) updatedCalc.titulo = String(payload.calculadora_titulo).trim();
    if (payload.calculadora_descripcion !== undefined) updatedCalc.descripcion = String(payload.calculadora_descripcion).trim();
  }

  const updated = {
    key,
    sector_slug: sec.slug,
    sector_nombre: sec.nombre,
    provincia_slug: payload.provincia_slug || 'todas',
    titulo_formulario: String(payload.titulo_formulario || current.titulo_formulario || `Solicitar Presupuesto de ${sec.nombre}`).trim(),
    instrucciones_cliente: String(payload.instrucciones_cliente || current.instrucciones_cliente || '').trim(),
    permitir_adjuntos: payload.permitir_adjuntos === undefined ? true : Boolean(payload.permitir_adjuntos === true || payload.permitir_adjuntos === 'true' || payload.permitir_adjuntos === '1' || payload.permitir_adjuntos === 'on'),
    formatos_admitidos: String(payload.formatos_admitidos || current.formatos_admitidos || '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx').trim(),
    calculadora_json: updatedCalc,
    campos: parsedCampos,
    explicacion_label: String(payload.explicacion_label || current.explicacion_label || 'Explicación detallada para el presupuesto').trim(),
    explicacion_placeholder: String(payload.explicacion_placeholder || current.explicacion_placeholder || '').trim(),
    updated_at: new Date().toISOString(),
  };

  s.custom_forms[key] = updated;
  if (key === sec.slug) {
    sec.formulario_presupuesto = {
      titulo_formulario: updated.titulo_formulario,
      instrucciones_cliente: updated.instrucciones_cliente,
      permitir_adjuntos: updated.permitir_adjuntos,
      formatos_admitidos: updated.formatos_admitidos,
      calculadora_json: updated.calculadora_json,
      campos: updated.campos,
      explicacion_label: updated.explicacion_label,
      explicacion_placeholder: updated.explicacion_placeholder,
    };
  }
  saveStore();
  return updated;
}

// ----------------------------------------------------------------------------
// Historial de Intereses del Visitante en Base de Datos (`visitor_interests`)
// Permite personalizar el Inicio según la zona y lo que el cliente ya ha visto
// (ej: si vio Aire Acondicionado en Madrid, recomienda más artículos de A/C y el anuncio de A/C en Madrid)
// ----------------------------------------------------------------------------
function recordVisitorInterest({ visitor_id, provincia_slug, sector_slug, post_id = null } = {}) {
  if (!visitor_id || !sector_slug) return null;
  const s = loadStore();
  if (!Array.isArray(s.visitor_interests)) s.visitor_interests = [];

  const cleanUid = String(visitor_id).trim();
  const cleanSec = String(sector_slug).trim();
  const cleanProv = provincia_slug ? String(provincia_slug).trim() : 'madrid';

  const existing = s.visitor_interests.find(
    v => v.visitor_id === cleanUid && v.sector_slug === cleanSec
  );

  if (existing) {
    existing.hits = (Number(existing.hits) || 1) + 1;
    existing.provincia_slug = cleanProv || existing.provincia_slug;
    if (post_id) existing.last_post_id = Number(post_id);
    existing.updated_at = new Date().toISOString();
  } else {
    s.visitor_interests.unshift({
      id: s.visitor_interests.length + 1,
      visitor_id: cleanUid,
      provincia_slug: cleanProv,
      sector_slug: cleanSec,
      last_post_id: post_id ? Number(post_id) : null,
      hits: 1,
      updated_at: new Date().toISOString(),
    });
    if (s.visitor_interests.length > 500) {
      s.visitor_interests = s.visitor_interests.slice(0, 500);
    }
  }
  saveStore();
  return existing || s.visitor_interests[0];
}

function getVisitorInterests(visitor_id) {
  if (!visitor_id) return [];
  const s = loadStore();
  if (!Array.isArray(s.visitor_interests)) return [];
  return s.visitor_interests
    .filter(v => v.visitor_id === String(visitor_id).trim())
    .sort((a, b) => {
      const timeDiff = new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
      if (Math.abs(timeDiff) > 5000) return timeDiff;
      return (Number(b.hits) || 1) - (Number(a.hits) || 1);
    });
}

// ----------------------------------------------------------------------------
// Recepción de Presupuestos para el Agente en Admin (LA IA NO RESPONDE AL USUARIO)
// y Generadores de Mensajes WhatsApp para los 4 Modelos de Negocio
// ----------------------------------------------------------------------------
function buildBusinessModelMessages(quote) {
  const provNombre = quote.provincia_nombre || 'tu provincia';
  const municipio = quote.municipio || provNombre;
  const sectorNombre = quote.sector_nombre || 'servicios profesionales';
  const explicacionResumida = String(quote.explicacion_cliente || 'solicitud de presupuesto verificada')
    .replace(/\s+/g, ' ')
    .substring(0, 170);
  const precioLead = Number(quote.precio_venta_lead) || 25;
  const valorTrabajo = Number(quote.valor_estimado_trabajo) || 1500;
  const cuotaZona = Number(quote.cuota_zona_mensual) || 400;
  const comisionPct = Number(quote.comision_obra_pct) || 12;
  const comisionEuros = Math.round((valorTrabajo * comisionPct) / 100);
  const payLink = quote.payment_link || `https://DimePrecio.es/pago-lead/${quote.codigo}`;

  // 1. 💰 Venta directa del contacto ("Pago por Lead")
  const pitchPagoPorLead = `Hola, soy de DimePrecio.es. Acaba de entrar un vecino en ${municipio} (${provNombre}) que necesita ${sectorNombre.toLowerCase()}: "${explicacionResumida}" (presupuesto estimado ${valorTrabajo.toLocaleString('es-ES')} €). ¿Te interesa quedarte su contacto en exclusiva por ${precioLead} €? Puedes desbloquearlo al instante por Bizum o en un clic aquí: ${payLink}`;

  // Mensaje con datos desbloqueados una vez pagado o para socio de zona
  const mensajeContactoDesbloqueado = `✅ [DimePrecio.es — Contacto Desbloqueado ${quote.codigo}]\n• Cliente: ${quote.nombre_cliente}\n• Teléfono / WhatsApp: ${quote.telefono_whatsapp}\n• Ubicación: ${municipio} (${provNombre})\n• Servicio: ${sectorNombre}\n• Explicación del cliente: ${quote.explicacion_cliente}\n• Detalles formulario: ${Object.entries(quote.campos_formulario_json || {}).map(([k, v]) => `${k}: ${v}`).join(' | ')}`;

  // 2. 🏠 Alquiler mensual de la zona ("Rank & Rent" Puro — 400 €/mes)
  const pitchAlquilerZona = `Hola, te escribo desde DimePrecio.es. Nuestra página de ${sectorNombre} en ${provNombre} (DimePrecio.es/provincia/${quote.provincia_slug}/${quote.sector_slug}) está recibiendo solicitudes constantes como la que acaba de entrar hoy en ${municipio}. No te voy a cobrar por cada contacto suelto: por ${cuotaZona} € al mes fijos, eres el socio oficial de DimePrecio.es en ${provNombre} para ${sectorNombre} y todos los presupuestos y llamadas que entren en ${provNombre} van directos a tu WhatsApp de forma automática.`;

  // 3. 🤝 Comisión por obra cerrada (Intermediación 10% - 20%)
  const pitchComisionObra = `Hola, soy el agente de DimePrecio.es en ${provNombre}. Tenemos un cliente filtrado en ${municipio} para ${sectorNombre.toLowerCase()} (presupuesto aprox. ${valorTrabajo.toLocaleString('es-ES')} €: "${explicacionResumida}"). Te pasamos el cliente ya filtrado para que vayas a ver la obra y le pases presupuesto, con nuestro acuerdo de ${comisionPct}% de comisión si se cierra el trabajo (aprox. ${comisionEuros.toLocaleString('es-ES')} €). ¿Te cuadra visitarlo esta semana?`;

  // 4. 📢 Espacio Destacado / "Especialista Oficial de la Provincia" (99€ - 299€/mes)
  const pitchEspacioDestacado = `Hola, soy de DimePrecio.es. Como habrás visto, posicionamos arriba en Google en ${provNombre} para ${sectorNombre}. Tenemos libre la plaza de "Empresa Nº1 Recomendada en ${provNombre}" con sello verificado y recepción prioritaria de presupuestos por suscripción mensual desde 199 €/mes. ¿Te paso los detalles para activarlo hoy?`;

  return {
    pitchPagoPorLead,
    mensajeContactoDesbloqueado,
    pitchAlquilerZona,
    pitchComisionObra,
    pitchEspacioDestacado,
  };
}

function submitQuoteRequestToAgent(payload, uploadedFiles = []) {
  const s = loadStore();
  if (!Array.isArray(s.quote_requests)) s.quote_requests = [];

  const prov = getLocationBySlug(payload.provincia_slug) || getLocationById(payload.provincia_id) || s.locations.find(l => l.slug === 'madrid');
  const sec = getSectorBySlug(payload.sector_slug) || getSectorById(payload.sector_id) || s.sectors[0];
  const zone = getZoneConfig(prov.slug, sec.slug);

  const newId = s.quote_requests.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;
  const codigo = `PP-2026-${String(newId).padStart(4, '0')}`;

  // Extraer campos personalizados enviados por el cliente
  const reservedKeys = new Set([
    'provincia_slug',
    'provincia_id',
    'sector_slug',
    'sector_id',
    'municipio',
    'nombre_cliente',
    'telefono_whatsapp',
    'email_opcional',
    'explicacion_cliente',
    'anuncio_id',
    'contenido_origen_id',
    'origen_titulo',
    'valor_estimado_trabajo',
  ]);

  const camposFormulario = {};
  if (payload.campos_formulario_json && typeof payload.campos_formulario_json === 'object') {
    Object.assign(camposFormulario, payload.campos_formulario_json);
  }
  for (const [k, v] of Object.entries(payload)) {
    if (!reservedKeys.has(k) && v !== undefined && v !== '') {
      const cleanKey = k.replace(/^campo_/, '');
      camposFormulario[cleanKey] = v;
    }
  }

  // Determinar estimación orientativa interna para el Agente (nunca se responde por IA al usuario)
  const mod = prov.modificador_precio_regional || 1.0;
  const baseMin = Math.round((sec.formula_precio_base_json?.min || 150) * mod);
  const baseMax = Math.round((sec.formula_precio_base_json?.max || 1800) * mod);
  let valorEstimado = Math.round((baseMin + baseMax) / 2);

  const rawObjetivo = camposFormulario.presupuesto_objetivo_cliente || payload.valor_estimado_trabajo || '';
  const numMatch = String(rawObjetivo).replace(/\./g, '').match(/(\d+)/);
  if (numMatch && Number(numMatch[1]) >= 40) {
    valorEstimado = Number(numMatch[1]);
  }

  const record = {
    id: newId,
    codigo,
    provincia_id: prov.id,
    provincia_slug: prov.slug,
    provincia_nombre: prov.nombre,
    municipio: String(payload.municipio || (prov.municipios && prov.municipios[0]) || prov.nombre).trim(),
    sector_id: sec.id,
    sector_slug: sec.slug,
    sector_nombre: sec.nombre,
    anuncio_id: payload.anuncio_id ? Number(payload.anuncio_id) : null,
    contenido_origen_id: payload.contenido_origen_id ? Number(payload.contenido_origen_id) : null,
    origen_titulo: String(payload.origen_titulo || `Solicitud en DimePrecio.es (${sec.nombre} en ${prov.nombre})`).trim(),
    nombre_cliente: String(payload.nombre_cliente || 'Vecino Solicitud Web').trim(),
    telefono_whatsapp: String(payload.telefono_whatsapp || '').trim(),
    email_opcional: String(payload.email_opcional || '').trim(),
    campos_formulario_json: camposFormulario,
    explicacion_cliente: String(payload.explicacion_cliente || '').trim(),
    archivos_adjuntos: uploadedFiles.map(f => ({
      originalName: f.originalname || f.originalName,
      filename: f.filename,
      url: `/admin/archivos/forms/${f.filename}`,
      size: f.size || 0,
      mimetype: f.mimetype || '',
    })),
    modelo_negocio_aplicado: zone.modelo_activo || 'lead_directo',
    precio_venta_lead: Number(zone.precio_lead_custom || sec.precios_negocio?.lead_recomendado || 35),
    cuota_zona_mensual: Number(zone.cuota_mensual_custom || sec.precios_negocio?.alquiler_mensual_zona || 400),
    comision_obra_pct: Number(zone.comision_pct_custom || sec.precios_negocio?.comision_obra_pct || 12),
    valor_estimado_trabajo: valorEstimado,
    whatsapp_socio_zona: zone.whatsapp_automatico || '',
    estado_agente: 'nuevo_en_bandeja',
    contacto_desbloqueado: zone.modelo_activo === 'alquiler_zona' && Boolean(zone.whatsapp_automatico),
    payment_link: `https://DimePrecio.es/pago-lead/${codigo}`,
    notas_agente: '',
    created_at: new Date().toISOString(),
  };

  s.quote_requests.unshift(record);

  // Incrementar conversiones en el anuncio de origen si existe
  if (record.anuncio_id) {
    const ad = (s.ads || []).find(a => Number(a.id) === Number(record.anuncio_id));
    if (ad) ad.conversiones = (Number(ad.conversiones) || 0) + 1;
  }

  saveStore();
  syncEntityToDatabase('pp_quote_requests', record);
  return {
    ...record,
    mensajes_negocio: buildBusinessModelMessages(record),
  };
}

function getQuoteRequests(filters = {}) {
  const s = loadStore();
  let list = [...(s.quote_requests || [])];
  if (filters.provincia_slug) list = list.filter(q => q.provincia_slug === filters.provincia_slug);
  if (filters.sector_slug) list = list.filter(q => q.sector_slug === filters.sector_slug);
  if (filters.modelo_negocio) list = list.filter(q => q.modelo_negocio_aplicado === filters.modelo_negocio);
  if (filters.estado_agente) list = list.filter(q => q.estado_agente === filters.estado_agente);

  return list.map(q => ({
    ...q,
    mensajes_negocio: buildBusinessModelMessages(q),
  }));
}

function updateQuoteRequestAgent(quoteId, payload) {
  const s = loadStore();
  const q = (s.quote_requests || []).find(item => Number(item.id) === Number(quoteId));
  if (!q) return null;

  if (payload.estado_agente !== undefined) q.estado_agente = payload.estado_agente;
  if (payload.modelo_negocio_aplicado !== undefined) q.modelo_negocio_aplicado = payload.modelo_negocio_aplicado;
  if (payload.precio_venta_lead !== undefined) q.precio_venta_lead = Number(payload.precio_venta_lead);
  if (payload.cuota_zona_mensual !== undefined) q.cuota_zona_mensual = Number(payload.cuota_zona_mensual);
  if (payload.comision_obra_pct !== undefined) q.comision_obra_pct = Number(payload.comision_obra_pct);
  if (payload.valor_estimado_trabajo !== undefined) q.valor_estimado_trabajo = Number(payload.valor_estimado_trabajo);
  if (payload.notas_agente !== undefined) q.notas_agente = String(payload.notas_agente);
  if (payload.contacto_desbloqueado !== undefined) {
    q.contacto_desbloqueado = Boolean(
      payload.contacto_desbloqueado === true ||
      payload.contacto_desbloqueado === 'true' ||
      payload.contacto_desbloqueado === '1' ||
      payload.contacto_desbloqueado === 1
    );
  }
  saveStore();
  syncEntityToDatabase('pp_quote_requests', q);
  return {
    ...q,
    mensajes_negocio: buildBusinessModelMessages(q),
  };
}

// ----------------------------------------------------------------------------
// Motor de Búsqueda Personalizada de DimePrecio.es (Páginas IA + Sectores + Anuncios)
// ----------------------------------------------------------------------------
function searchEverything({ query = '', provinciaSlug = null, sectorSlug = null, limit = 24 } = {}) {
  const s = loadStore();
  const rawQ = String(query || '').trim();
  const normQ = rawQ
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const tokens = normQ.split(/\s+/).filter(t => t.length >= 2);

  // Detectar si en la propia consulta escribió el nombre de alguna provincia o municipio
  let detectedProvInQuery = null;
  if (normQ) {
    for (const loc of s.locations) {
      const locNorm = loc.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normQ.includes(locNorm) || normQ.includes(loc.slug.replace(/-/g, ' '))) {
        detectedProvInQuery = loc;
        break;
      }
      for (const mun of loc.municipios || []) {
        const munNorm = mun.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (munNorm.length >= 4 && normQ.includes(munNorm)) {
          detectedProvInQuery = loc;
          break;
        }
      }
      if (detectedProvInQuery) break;
    }
  }

  const effectiveProvSlug = provinciaSlug || (detectedProvInQuery ? detectedProvInQuery.slug : null);

  // 1. Buscar sectores coincidentes
  const matchedSectors = s.sectors
    .map(sec => {
      let score = 0;
      const nameNorm = sec.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const kws = (sec.keywords || []).map(k => k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));

      if (sectorSlug && sec.slug === sectorSlug) score += 80;
      if (!tokens.length && !sectorSlug) score += 10;

      for (const tok of tokens) {
        if (nameNorm.includes(tok)) score += 35;
        if (sec.slug.includes(tok)) score += 25;
        for (const kw of kws) {
          if (kw.includes(tok)) score += 22;
        }
      }
      return { ...sec, _score: score };
    })
    .filter(sec => sec._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 8);

  const topMatchedSectorSlugs = matchedSectors.map(sec => sec.slug);

  // 2. Buscar páginas IA (`posts`) con impulso por provincia del usuario y páginas seleccionadas
  const matchedPages = (s.posts || [])
    .filter(p => p.status === 'published')
    .map(p => {
      let score = 0;
      const hay = `${p.title} ${p.excerpt || ''} ${p.keywords || ''} ${p.sector_nombre || ''} ${p.provincia_nombre || ''} ${p.municipio_tag || ''}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      if (sectorSlug && p.sector_slug === sectorSlug) score += 45;
      else if (topMatchedSectorSlugs.includes(p.sector_slug)) score += 25;

      for (const tok of tokens) {
        if (hay.includes(tok)) score += 28;
        if ((p.title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(tok)) {
          score += 20;
        }
      }

      if (!tokens.length && !sectorSlug) score += 15;

      // Si hubo match semántico o no hay texto pero sí filtro, aplicar impulso de algoritmo DimePrecio
      if (score > 0) {
        if (p.is_pinned) {
          score += 75; // Páginas fijadas siempre arriba
        }
        if (effectiveProvSlug && p.provincia_slug === effectiveProvSlug) {
          score += 50; // Fuerte priorización de la provincia detectada del usuario
        }
        if (p.is_selected) {
          score += 35; // Priorización de páginas recomendadas en Admin
        }
        score += (Number(p.priority_weight) || 5) * 3;
      }

      return { ...p, _score: score };
    })
    .filter(p => {
      if (provinciaSlug && p.provincia_slug && p.provincia_slug !== provinciaSlug && tokens.length === 0) {
        return false;
      }
      return p._score > 0;
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, limit);

  // 3. Buscar Anuncios Oficiales de DimePrecio.es recomendados para esta búsqueda
  const recommendedAds = getRecommendedAds({
    provinciaSlug: effectiveProvSlug,
    sectorSlug: sectorSlug || (topMatchedSectorSlugs[0] || null),
    preferredSectors: topMatchedSectorSlugs,
    limit: 6,
  });

  return {
    query: rawQ,
    effectiveProvSlug,
    detectedProvInQuery,
    matchedSectors,
    matchedPages,
    recommendedAds,
  };
}

// ----------------------------------------------------------------------------
// Estadísticas ejecutivas para el Panel de Admin (Anuncios + 4 Modelos + Presupuestos)
// ----------------------------------------------------------------------------
function getAdminOverviewStats() {
  const s = loadStore();
  const ads = s.ads || [];
  const quotes = s.quote_requests || [];
  const zones = s.zone_configs || [];
  const pages = s.posts || [];

  const adsByModel = {
    lead_directo: ads.filter(a => a.modelo_negocio === 'lead_directo').length,
    alquiler_zona: ads.filter(a => a.modelo_negocio === 'alquiler_zona').length,
    comision_obra: ads.filter(a => a.modelo_negocio === 'comision_obra').length,
    espacio_destacado: ads.filter(a => a.modelo_negocio === 'espacio_destacado').length,
  };

  // Cálculo de ingresos potenciales / activos según los 4 modelos de negocio
  const potentialLeadRevenue = quotes
    .filter(q => q.modelo_negocio_aplicado === 'lead_directo')
    .reduce((acc, q) => acc + (Number(q.precio_venta_lead) || 30), 0);

  const monthlyRankRentMRR = ads
    .filter(a => a.activo && a.modelo_negocio === 'alquiler_zona')
    .reduce((acc, a) => acc + (Number(a.cuota_mensual) || 400), 0);

  const monthlySponsoredMRR = ads
    .filter(a => a.activo && a.modelo_negocio === 'espacio_destacado')
    .reduce((acc, a) => acc + (Number(a.cuota_mensual) || 199), 0);

  const potentialCommissionRevenue = quotes
    .filter(q => q.modelo_negocio_aplicado === 'comision_obra')
    .reduce((acc, q) => acc + Math.round(((Number(q.valor_estimado_trabajo) || 0) * (Number(q.comision_obra_pct) || 12)) / 100), 0);

  return {
    totalProvinces: (s.locations || []).length,
    totalSectors: (s.sectors || []).length,
    totalCombinations: (s.locations || []).length * (s.sectors || []).length,
    totalPages: pages.length,
    pinnedPages: pages.filter(p => p.is_pinned).length,
    selectedPages: pages.filter(p => p.is_selected).length,
    totalAds: ads.length,
    pinnedAds: ads.filter(a => a.fijado).length,
    selectedAds: ads.filter(a => a.seleccionado).length,
    adsByModel,
    configuredZonesCount: zones.length,
    totalQuotes: quotes.length,
    newQuotesInInbox: quotes.filter(q => q.estado_agente === 'nuevo_en_bandeja').length,
    potentialLeadRevenue,
    monthlyRankRentMRR,
    monthlySponsoredMRR,
    potentialCommissionRevenue,
    algorithmConfig: s.settings?.algorithm_config || {
      peso_fijados: 65,
      peso_provincia_detectada: 45,
      peso_anuncio_seleccionado: 40,
      peso_afinidad_sector: 30,
      peso_prioridad_manual: 25,
      peso_popularidad: 15,
    },
  };
}

function updateAlgorithmConfig(payload) {
  const s = loadStore();
  if (!s.settings) s.settings = {};
  s.settings.algorithm_config = {
    peso_fijados: Number(payload.peso_fijados ?? 65),
    peso_provincia_detectada: Number(payload.peso_provincia_detectada ?? 45),
    peso_anuncio_seleccionado: Number(payload.peso_anuncio_seleccionado ?? 40),
    peso_afinidad_sector: Number(payload.peso_afinidad_sector ?? 30),
    peso_prioridad_manual: Number(payload.peso_prioridad_manual ?? 25),
    peso_popularidad: Number(payload.peso_popularidad ?? 15),
  };
  saveStore();
  return s.settings.algorithm_config;
}

module.exports = {
  slugify,
  loadStore,
  saveStore,
  getLocations,
  getLocationBySlug,
  getLocationById,
  getSectors,
  getSectorBySlug,
  getSectorById,
  addSector,
  updateSector,
  getZoneConfig,
  upsertZoneConfig,
  getAllZoneConfigs,
  getAds,
  getRecommendedAds,
  createOrUpdateAd,
  toggleAdStatus,
  togglePostFlag,
  updatePostAlgorithmSettings,
  getSeoInterlinks,
  deleteAd,
  getCustomForm,
  saveCustomForm,
  recordVisitorInterest,
  getVisitorInterests,
  submitQuoteRequestToAgent,
  getQuoteRequests,
  updateQuoteRequestAgent,
  buildBusinessModelMessages,
  searchEverything,
  getAdminOverviewStats,
  updateAlgorithmConfig,
  syncFromDatabase,
};
