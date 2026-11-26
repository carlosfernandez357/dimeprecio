// ============================================================================
// DimePrecio.es — Servicio Google Search Console (GSC)
// Soporta rangos flexibles (24h, 3d, 7d, 28d, 3m, 6m, 12m), datos frescos
// (dataState: 'all'), autodetección de propiedad y sincronización por lotes.
// ============================================================================
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const pool = require('../db');

const KEY_FILE = process.env.GSC_KEY_FILE
  ? path.resolve(process.env.GSC_KEY_FILE)
  : path.join(__dirname, '..', 'google-search-console.json');

const DEFAULT_SITE_URL = process.env.GSC_SITE_URL || 'sc-domain:dimeprecio.es';

const DATE_RANGES = {
  '24h':  { key: '24h',  label: 'Últimas 24h',    days: 1 },
  '3d':   { key: '3d',   label: 'Últimos 3 días', days: 3 },
  '7d':   { key: '7d',   label: 'Últimos 7 días', days: 7 },
  '28d':  { key: '28d',  label: 'Últimos 28 días', days: 28 },
  '90d':  { key: '90d',  label: 'Últimos 3 meses', days: 90 },
  '180d': { key: '180d', label: 'Últimos 6 meses', days: 180 },
  '365d': { key: '365d', label: 'Últimos 12 meses', days: 365 },
};

const RANGE_LIST = Object.values(DATE_RANGES);
const CACHE_TTL_MS = 5 * 60 * 1000;

let authClient = null;
let resolvedSiteUrl = null;
let tableEnsured = false;
const cache = new Map();

function normalizeRange(rangeOrDays) {
  if (typeof rangeOrDays === 'string' && DATE_RANGES[rangeOrDays]) {
    return DATE_RANGES[rangeOrDays];
  }
  const num = Number(rangeOrDays);
  if (num === 1) return DATE_RANGES['24h'];
  if (num === 3) return DATE_RANGES['3d'];
  if (num === 7) return DATE_RANGES['7d'];
  if (num === 90) return DATE_RANGES['90d'];
  if (num === 180) return DATE_RANGES['180d'];
  if (num === 365) return DATE_RANGES['365d'];
  return DATE_RANGES['28d'];
}

function getAuth() {
  if (authClient) return authClient;
  if (!fs.existsSync(KEY_FILE)) {
    throw new Error(
      `Archivo de credenciales no encontrado (${path.basename(KEY_FILE)}). ` +
      `Sube tu JSON de cuenta de servicio de Google Cloud a la raíz del proyecto.`
    );
  }
  authClient = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  return authClient;
}

function formatUtcDate(date) {
  return date.toISOString().split('T')[0];
}

function buildDateWindow(days) {
  // Con dataState: 'all' Google incluye datos frescos hasta hoy/ayer.
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - Math.max(1, Number(days) || 7));
  return {
    startDate: formatUtcDate(start),
    endDate: formatUtcDate(end),
  };
}

/**
 * Resuelve la propiedad de GSC válida (usa DEFAULT_SITE_URL o autodetecta con sites.list).
 */
async function resolveSiteUrl(searchconsole) {
  if (resolvedSiteUrl) return resolvedSiteUrl;
  try {
    const sitesRes = await searchconsole.sites.list();
    const entries = (sitesRes.data && sitesRes.data.siteEntry) || [];
    if (entries.length > 0) {
      const exact = entries.find(s => s.siteUrl === DEFAULT_SITE_URL);
      if (exact) {
        resolvedSiteUrl = exact.siteUrl;
        return resolvedSiteUrl;
      }
      const domainMatch = entries.find(s => /dimeprecio\.es/i.test(s.siteUrl || ''));
      if (domainMatch) {
        resolvedSiteUrl = domainMatch.siteUrl;
        return resolvedSiteUrl;
      }
      resolvedSiteUrl = entries[0].siteUrl;
      return resolvedSiteUrl;
    }
  } catch (err) {
    console.warn('[GSC sites.list warning]', err.message);
  }
  resolvedSiteUrl = DEFAULT_SITE_URL;
  return resolvedSiteUrl;
}

async function ensureTable() {
  if (tableEnsured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS gsc_queries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      query_text VARCHAR(255) NOT NULL UNIQUE,
      clicks INT DEFAULT 0,
      impressions INT DEFAULT 0,
      ctr DECIMAL(5,2) DEFAULT 0.00,
      position DECIMAL(5,1) DEFAULT 0.0,
      used_count INT DEFAULT 0,
      last_used_at DATETIME NULL,
      is_selected TINYINT DEFAULT 1,
      status VARCHAR(30) DEFAULT 'pending',
      first_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_impressions (impressions),
      INDEX idx_used (used_count),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  tableEnsured = true;
}

async function saveSyncMeta(meta) {
  try {
    await pool.query(
      `INSERT INTO settings (setting_key, setting_value) VALUES ('gsc_sync_meta', ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [JSON.stringify(meta)]
    );
  } catch {
    // silencioso si no existe tabla settings
  }
}

async function getSyncMeta() {
  try {
    const [rows] = await pool.query(
      `SELECT setting_value FROM settings WHERE setting_key = 'gsc_sync_meta' LIMIT 1`
    );
    if (rows && rows[0] && rows[0].setting_value) {
      return JSON.parse(rows[0].setting_value);
    }
  } catch {
    // silencioso
  }
  return {
    lastSyncAt: null,
    lastRange: '7d',
    startDate: null,
    endDate: null,
    syncedCount: 0,
    siteUrl: resolvedSiteUrl || DEFAULT_SITE_URL,
    lastError: null,
  };
}

/**
 * Consulta el rendimiento en vivo de Search Console para un rango (24h, 3d, 7d, 28d, 90d, 180d, 365d).
 */
async function getSearchPerformance({
  range = '7d',
  days = null,
  dimension = 'query',
  limit = 1000,
  forceRefresh = false,
} = {}) {
  const rangeObj = normalizeRange(days || range);
  const safeLimit = Math.min(Math.max(Number(limit) || 1000, 10), 5000);
  const dim = dimension === 'page' ? 'page' : 'query';
  const cacheKey = `${rangeObj.key}_${dim}_${safeLimit}`;

  if (!forceRefresh) {
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data;
    }
  }

  const auth = getAuth();
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  const siteUrl = await resolveSiteUrl(searchconsole);

  let { startDate, endDate } = buildDateWindow(rangeObj.days);

  async function runQuery(sDate, eDate) {
    const res = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: sDate,
        endDate: eDate,
        dimensions: [dim],
        rowLimit: safeLimit,
        dataState: 'all', // Incluye datos frescos (imprescindible para 24h, 3d y 7d)
        aggregationType: 'auto',
      },
    });
    return res.data.rows || [];
  }

  let rawRows = await runQuery(startDate, endDate);

  // Si en rango 24h Google aún no publicó datos del día actual, ampliamos 1 día hacia atrás
  if (rawRows.length === 0 && rangeObj.days <= 3) {
    const widened = buildDateWindow(rangeObj.days + 2);
    startDate = widened.startDate;
    endDate = widened.endDate;
    rawRows = await runQuery(startDate, endDate);
  }

  let totalClicks = 0;
  let totalImpressions = 0;
  let sumPosition = 0;

  const rows = rawRows.map(r => {
    const key = (r.keys && r.keys[0]) || '';
    const clicks = Number(r.clicks) || 0;
    const impressions = Number(r.impressions) || 0;
    const ctr = Number(((Number(r.ctr) || 0) * 100).toFixed(2));
    const position = Number((Number(r.position) || 0).toFixed(1));

    totalClicks += clicks;
    totalImpressions += impressions;
    sumPosition += Number(r.position) || 0;

    return { item: key, clicks, impressions, ctr, position };
  });

  const avgPosition = rows.length > 0 ? (sumPosition / rows.length).toFixed(1) : '0.0';
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  const result = {
    ok: true,
    siteUrl,
    range: rangeObj,
    dateRange: { startDate, endDate, days: rangeObj.days, label: rangeObj.label },
    totals: { totalClicks, totalImpressions, avgCtr, avgPosition, totalRows: rows.length },
    dimension: dim,
    rows,
  };

  cache.set(cacheKey, { timestamp: Date.now(), data: result });
  return result;
}

/**
 * Sincroniza consultas desde Google Search Console hacia MySQL usando lotes rápidos.
 */
async function syncQueriesToDatabase({ range = '7d', days = null, limit = 1000, forceRefresh = true } = {}) {
  await ensureTable();
  const rangeObj = normalizeRange(days || range);

  try {
    const gscData = await getSearchPerformance({
      range: rangeObj.key,
      dimension: 'query',
      limit,
      forceRefresh,
    });

    const validRows = (gscData.rows || []).filter(r => r.item && r.item.trim());
    let syncedCount = 0;

    // Upsert por lotes de 200 filas para máxima velocidad y escalabilidad
    const chunkSize = 200;
    for (let i = 0; i < validRows.length; i += chunkSize) {
      const chunk = validRows.slice(i, i + chunkSize);
      const placeholders = chunk.map(() => '(?, ?, ?, ?, ?, NOW())').join(', ');
      const values = [];
      for (const r of chunk) {
        values.push(
          r.item.trim().substring(0, 255),
          r.clicks || 0,
          r.impressions || 0,
          r.ctr || 0,
          r.position || 0
        );
      }

      await pool.query(
        `INSERT INTO gsc_queries (query_text, clicks, impressions, ctr, position, last_seen_at)
         VALUES ${placeholders}
         ON DUPLICATE KEY UPDATE
           clicks = VALUES(clicks),
           impressions = VALUES(impressions),
           ctr = VALUES(ctr),
           position = VALUES(position),
           last_seen_at = NOW()`,
        values
      );
      syncedCount += chunk.length;
    }

    const meta = {
      lastSyncAt: new Date().toISOString(),
      lastRange: rangeObj.key,
      rangeLabel: rangeObj.label,
      startDate: gscData.dateRange.startDate,
      endDate: gscData.dateRange.endDate,
      syncedCount,
      totalRows: validRows.length,
      siteUrl: gscData.siteUrl,
      lastError: null,
    };
    await saveSyncMeta(meta);

    return { ok: true, ...meta };
  } catch (err) {
    const prevMeta = await getSyncMeta();
    await saveSyncMeta({
      ...prevMeta,
      lastRange: rangeObj.key,
      lastError: err.message,
    });
    throw err;
  }
}

/**
 * Obtiene las consultas almacenadas en MySQL con filtros, ordenación y paginación.
 */
async function getStoredQueries({
  status = '',
  search = '',
  limit = 200,
  offset = 0,
  sortBy = 'impressions',
  sortOrder = 'DESC',
} = {}) {
  await ensureTable();

  const whereClauses = ['1=1'];
  const params = [];

  if (status === 'pending') {
    whereClauses.push('used_count = 0');
  } else if (status === 'used') {
    whereClauses.push('used_count > 0');
  }

  if (search && search.trim()) {
    whereClauses.push('query_text LIKE ?');
    params.push(`%${search.trim()}%`);
  }

  const allowedSorts = ['impressions', 'clicks', 'ctr', 'position', 'used_count', 'last_seen_at'];
  const safeSort = allowedSorts.includes(sortBy) ? sortBy : 'impressions';
  const safeOrder = String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const whereSql = whereClauses.join(' AND ');

  const [rows] = await pool.query(
    `SELECT * FROM gsc_queries WHERE ${whereSql} ORDER BY ${safeSort} ${safeOrder} LIMIT ? OFFSET ?`,
    [...params, Math.min(Math.max(Number(limit) || 200, 10), 1000), Math.max(0, Number(offset) || 0)]
  );

  const [[filteredCount]] = await pool.query(
    `SELECT COUNT(*) AS cnt FROM gsc_queries WHERE ${whereSql}`,
    params
  );

  const [[totals]] = await pool.query(`
    SELECT
      COUNT(*) as totalQueries,
      SUM(CASE WHEN used_count > 0 THEN 1 ELSE 0 END) as totalUsed,
      SUM(CASE WHEN used_count = 0 THEN 1 ELSE 0 END) as totalPending,
      COALESCE(SUM(impressions), 0) as totalImpressions,
      COALESCE(SUM(clicks), 0) as totalClicks
    FROM gsc_queries
  `);

  return {
    rows: rows || [],
    filteredTotal: Number(filteredCount?.cnt || 0),
    totals: totals || { totalQueries: 0, totalUsed: 0, totalPending: 0, totalImpressions: 0, totalClicks: 0 },
  };
}

async function markQueryUsed(queryText) {
  if (!queryText) return;
  await ensureTable();
  await pool.query(
    `UPDATE gsc_queries
     SET used_count = used_count + 1, last_used_at = NOW(), status = 'completed'
     WHERE query_text = ?`,
    [queryText.trim()]
  );
}

/**
 * Envía un lote de consultas pendientes a la cola de generación masiva.
 */
async function enqueuePendingBatch({ queries = [], limit = 100 } = {}) {
  await ensureTable();
  const articleQueue = require('./articleQueue');
  let list = [];
  if (Array.isArray(queries) && queries.length > 0) {
    list = queries;
  } else {
    const [dbRows] = await pool.query(
      'SELECT query_text FROM gsc_queries WHERE used_count = 0 ORDER BY impressions DESC LIMIT ?',
      [Math.min(Math.max(Number(limit) || 100, 1), 200)]
    );
    list = (dbRows || []).map(r => r.query_text);
  }
  if (!list.length) return { added: 0, total: 0 };
  const result = await articleQueue.addBulkToQueue(list);
  return { added: result.added || 0, total: result.added || 0 };
}

function clearCache() {
  cache.clear();
  resolvedSiteUrl = null;
}

module.exports = {
  DATE_RANGES,
  RANGE_LIST,
  normalizeRange,
  ensureTable,
  getSearchPerformance,
  syncQueriesToDatabase,
  getSyncMeta,
  getStoredQueries,
  markQueryUsed,
  enqueuePendingBatch,
  clearCache,
  SITE_URL: DEFAULT_SITE_URL,
};