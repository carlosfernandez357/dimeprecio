-- ============================================================================
-- PidePrecio.es — Esquema MySQL (idempotente: se puede ejecutar varias veces)
-- Base de datos: u256818095_dimeprecio
-- Ejecutar ENTERO en phpMyAdmin (pestaña SQL) o con:  npm run db:setup
-- ============================================================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1) AJUSTES GENERALES (clave/valor; el valor puede ser JSON en texto) --------
CREATE TABLE IF NOT EXISTS settings (
  setting_key   VARCHAR(120) NOT NULL PRIMARY KEY,
  setting_value LONGTEXT NULL,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) USUARIOS DEL PANEL ------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(80)  NOT NULL UNIQUE,
  email         VARCHAR(160) NULL,
  display_name  VARCHAR(120) NULL,
  role          VARCHAR(30)  NOT NULL DEFAULT 'admin',
  password_hash VARCHAR(255) NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) CATEGORÍAS --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(160) NOT NULL,
  slug        VARCHAR(160) NOT NULL UNIQUE,
  description TEXT NULL,
  color       VARCHAR(20) DEFAULT '#0f4c81',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4) MATRIZ GEOGRÁFICA: 52 provincias ----------------------------------------
CREATE TABLE IF NOT EXISTS pp_locations (
  id                          INT AUTO_INCREMENT PRIMARY KEY,
  slug                        VARCHAR(80)  NOT NULL UNIQUE,
  nombre                      VARCHAR(120) NOT NULL,
  comunidad_autonoma          VARCHAR(120) NULL,
  lat                         DECIMAL(9,6) NULL,
  lng                         DECIMAL(9,6) NULL,
  poblacion                   INT NULL,
  modificador_precio_regional DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  municipios                  JSON NULL,
  activa                      TINYINT(1) NOT NULL DEFAULT 1,
  INDEX idx_loc_activa (activa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5) MATRIZ DE SECTORES: 30 sectores ------------------------------------------
CREATE TABLE IF NOT EXISTS pp_sectors (
  id                        INT AUTO_INCREMENT PRIMARY KEY,
  slug                      VARCHAR(100) NOT NULL UNIQUE,
  nombre                    VARCHAR(190) NOT NULL,
  icono                     VARCHAR(20)  NULL,
  tier                      VARCHAR(40)  NULL,
  keywords                  JSON NULL,
  business_models           JSON NULL,
  precios_negocio           JSON NULL,
  formulario_presupuesto    JSON NULL,
  formula_precio_base_json  JSON NULL,
  activo                    TINYINT(1) NOT NULL DEFAULT 1,
  INDEX idx_sec_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6) PÁGINAS / ARTÍCULOS CREADOS POR LA IA ------------------------------------
CREATE TABLE IF NOT EXISTS posts (
  id                     INT AUTO_INCREMENT PRIMARY KEY,
  title                  VARCHAR(255) NOT NULL,
  slug                   VARCHAR(255) NOT NULL UNIQUE,
  excerpt                TEXT NULL,
  content                LONGTEXT NULL,
  featured_image         VARCHAR(500) NULL,
  image_alt              VARCHAR(255) NULL,
  category_id            INT NULL,
  author_id              INT NULL DEFAULT 1,
  status                 VARCHAR(20) NOT NULL DEFAULT 'published',
  is_featured            TINYINT(1) NOT NULL DEFAULT 0,
  is_breaking            TINYINT(1) NOT NULL DEFAULT 0,
  is_selected            TINYINT(1) NOT NULL DEFAULT 1,
  is_pinned              TINYINT(1) NOT NULL DEFAULT 0,
  priority_weight        INT NOT NULL DEFAULT 5,
  meta_title             VARCHAR(255) NULL,
  meta_description       VARCHAR(500) NULL,
  keywords               VARCHAR(500) NULL,
  provincia_id           INT NULL,
  provincia_slug         VARCHAR(80)  NULL,
  provincia_nombre       VARCHAR(120) NULL,
  sector_id              INT NULL,
  sector_slug            VARCHAR(100) NULL,
  sector_nombre          VARCHAR(190) NULL,
  sector_icono           VARCHAR(20)  NULL,
  municipio_tag          VARCHAR(140) NULL,
  precio_min_orientativo INT NULL,
  precio_max_orientativo INT NULL,
  views                  INT NOT NULL DEFAULT 0,
  likes                  INT NOT NULL DEFAULT 0,
  published_at           DATETIME NULL,
  created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_posts_status_pub (status, published_at),
  INDEX idx_posts_prov_sec (provincia_slug, sector_slug),
  INDEX idx_posts_cat (category_id),
  INDEX idx_posts_views (views)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7) ANUNCIOS ANÓNIMOS DE PIDEPRECIO (fijados / recomendados) -----------------
CREATE TABLE IF NOT EXISTS pp_ads (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  codigo               VARCHAR(64)  NOT NULL,
  titulo               VARCHAR(255) NOT NULL,
  subtitulo            TEXT NULL,
  badge                VARCHAR(140) NULL,
  sello                VARCHAR(140) NULL,
  cta_texto            VARCHAR(100) NULL,
  marca_visible        VARCHAR(80)  DEFAULT 'PidePrecio.es',
  es_anonimo           TINYINT(1)   DEFAULT 1,
  provincia_slug       VARCHAR(80)  NULL,
  provincia_nombre     VARCHAR(120) NULL,
  sector_slug          VARCHAR(100) NULL,
  sector_nombre        VARCHAR(190) NULL,
  sector_icono         VARCHAR(20)  NULL,
  municipios_cubiertos JSON NULL,
  fijado               TINYINT(1)   DEFAULT 0,
  seleccionado         TINYINT(1)   DEFAULT 1,
  prioridad            INT          DEFAULT 8,
  activo               TINYINT(1)   DEFAULT 1,
  impresiones          INT          DEFAULT 0,
  clics                INT          DEFAULT 0,
  conversiones         INT          DEFAULT 0,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ads_zona (provincia_slug, sector_slug),
  INDEX idx_ads_activo (activo, fijado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8) FORMULARIOS Y CALCULADORAS POR SECTOR (editables desde el admin) ----------
CREATE TABLE IF NOT EXISTS pp_sector_forms (
  id                        INT AUTO_INCREMENT PRIMARY KEY,
  form_key                  VARCHAR(160) NOT NULL UNIQUE,
  sector_slug               VARCHAR(100) NOT NULL,
  sector_nombre             VARCHAR(190) NULL,
  provincia_slug            VARCHAR(80)  DEFAULT 'todas',
  titulo                    VARCHAR(255) NULL,
  titulo_formulario         VARCHAR(255) NULL,
  explicacion_cliente       TEXT NULL,
  instrucciones_cliente     TEXT NULL,
  explicacion_label         VARCHAR(255) NULL,
  explicacion_placeholder   TEXT NULL,
  calculadora_json          JSON NULL,
  campos_json               JSON NULL,
  permitir_adjuntos         TINYINT(1) DEFAULT 1,
  formatos_admitidos        VARCHAR(255) NULL,
  plantilla_descargable_url VARCHAR(255) NULL,
  plantilla_nombre_archivo  VARCHAR(255) NULL,
  updated_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_forms_sector (sector_slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9) SOLICITUDES DE PRESUPUESTO -> BANDEJA DEL AGENTE (CRM privado) ------------
CREATE TABLE IF NOT EXISTS pp_quote_requests (
  id                     INT AUTO_INCREMENT PRIMARY KEY,
  codigo                 VARCHAR(40) NOT NULL,
  provincia_slug         VARCHAR(80)  NULL,
  provincia_nombre       VARCHAR(120) NULL,
  municipio              VARCHAR(140) NULL,
  sector_slug            VARCHAR(100) NULL,
  sector_nombre          VARCHAR(190) NULL,
  anuncio_id             INT NULL,
  contenido_origen_id    INT NULL,
  origen_titulo          VARCHAR(255) NULL,
  nombre_cliente         VARCHAR(140) NULL,
  telefono_whatsapp      VARCHAR(50)  NULL,
  email_opcional         VARCHAR(140) NULL,
  campos_formulario_json JSON NULL,
  explicacion_cliente    TEXT NULL,
  archivos_adjuntos_json JSON NULL,
  modelo_negocio_aplicado VARCHAR(50) NULL,
  precio_venta_lead      DECIMAL(10,2) DEFAULT 35.00,
  valor_estimado_trabajo DECIMAL(12,2) DEFAULT 1500.00,
  estado_agente          VARCHAR(50) DEFAULT 'nuevo_en_bandeja',
  contacto_desbloqueado  TINYINT(1) DEFAULT 0,
  payment_link           VARCHAR(255) NULL,
  notas_agente           TEXT NULL,
  created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_qr_estado (estado_agente),
  INDEX idx_qr_zona (provincia_slug, sector_slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10) INTERESES DEL VISITANTE (personalización del inicio) ----------------------
CREATE TABLE IF NOT EXISTS pp_visitor_interests (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  visitor_id     VARCHAR(120) NOT NULL,
  provincia_slug VARCHAR(80)  NULL,
  sector_slug    VARCHAR(100) NULL,
  last_post_id   INT NULL,
  hits           INT DEFAULT 1,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_visitor (visitor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11) PROGRAMACIÓN AUTOMÁTICA DE PÁGINAS CON IA ---------------------------------
CREATE TABLE IF NOT EXISTS schedules (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  topic          VARCHAR(255) NOT NULL,
  category_id    INT NULL,
  provincia_slug VARCHAR(80)  NULL,
  sector_slug    VARCHAR(100) NULL,
  frequency      VARCHAR(30)  DEFAULT 'daily',
  cron_expr      VARCHAR(60)  DEFAULT '0 9 * * *',
  auto_publish   TINYINT(1)   DEFAULT 1,
  is_active      TINYINT(1)   DEFAULT 1,
  last_run       DATETIME NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12) SEGUIMIENTO / ALGORITMO DE RECOMENDACIÓN (opcional; el código detecta si existen)
CREATE TABLE IF NOT EXISTS visitors (
  id            VARCHAR(120) NOT NULL PRIMARY KEY,
  device        VARCHAR(30) NULL,
  total_views   INT NOT NULL DEFAULT 0,
  first_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS post_views (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id     INT NOT NULL,
  visitor_id  VARCHAR(120) NULL,
  started_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pv_post (post_id),
  INDEX idx_pv_visitor (visitor_id),
  INDEX idx_pv_started (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS rec_impressions (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id     INT NOT NULL,
  visitor_id  VARCHAR(120) NULL,
  placement   VARCHAR(60) NULL,
  clicked     TINYINT(1) DEFAULT 0,
  shown_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ri_post (post_id),
  INDEX idx_ri_shown (shown_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
