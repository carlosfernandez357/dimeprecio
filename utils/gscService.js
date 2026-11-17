const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const KEY_FILE = path.join(__dirname, '..', 'google-search-console.json');
const SITE_URL = 'sc-domain:dimeprecio.es';

let authClient = null;
const cache = new Map(); // key -> { timestamp, data }
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos de caché

function getAuth() {
  if (authClient) return authClient;
  if (!fs.existsSync(KEY_FILE)) {
    throw new Error('Archivo google-search-console.json no encontrado.');
  }
  authClient = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  return authClient;
}

/**
 * Consulta el rendimiento de Search Console para un rango de días y dimensión dada.
 * @param {Object} options
 * @param {number} options.days Número de días hacia atrás (ej. 7, 28, 90). Por defecto 7.
 * @param {string} options.dimension 'query' o 'page'. Por defecto 'query'.
 * @param {number} options.limit Máximo de filas a devolver (1-1000). Por defecto 100.
 */
async function getSearchPerformance({ days = 7, dimension = 'query', limit = 100 } = {}) {
  const cacheKey = `${days}_${dimension}_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  const auth = getAuth();
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  // Search Console consolida datos con ~2 días de desfase respecto al día actual
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() - 2);

  const start = new Date(end);
  start.setDate(start.getDate() - (Number(days) - 1));

  const startDate = start.toISOString().split('T')[0];
  const endDate = end.toISOString().split('T')[0];

  const dim = dimension === 'page' ? 'page' : 'query';

  const res = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: [dim],
      rowLimit: Math.min(Math.max(Number(limit) || 100, 10), 500),
      aggregationType: 'auto',
    },
  });

  const rawRows = res.data.rows || [];

  let totalClicks = 0;
  let totalImpressions = 0;
  let sumPosition = 0;

  const rows = rawRows.map(r => {
    const key = (r.keys && r.keys[0]) || '';
    const clicks = Number(r.clicks) || 0;
    const impressions = Number(r.impressions) || 0;
    const ctr = ((Number(r.ctr) || 0) * 100).toFixed(2);
    const position = (Number(r.position) || 0).toFixed(1);

    totalClicks += clicks;
    totalImpressions += impressions;
    sumPosition += (Number(r.position) || 0);

    return {
      item: key,
      clicks,
      impressions,
      ctr,
      position,
    };
  });

  const avgPosition = rows.length > 0 ? (sumPosition / rows.length).toFixed(1) : '0.0';
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  const result = {
    ok: true,
    siteUrl: SITE_URL,
    dateRange: {
      startDate,
      endDate,
      days: Number(days),
    },
    totals: {
      totalClicks,
      totalImpressions,
      avgCtr,
      avgPosition,
      totalRows: rows.length,
    },
    dimension: dim,
    rows,
  };

  cache.set(cacheKey, { timestamp: Date.now(), data: result });
  return result;
}

module.exports = {
  getSearchPerformance,
  SITE_URL,
};