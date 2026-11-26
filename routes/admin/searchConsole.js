// ============================================================================
// Rutas Admin: Google Search Console & Auto-Lotes IA
// Modular, escalable y simple (rangos 24h, 3d, 7d, 28d, 3m, 6m, 12m)
// ============================================================================
const express = require('express');
const gscService = require('../../utils/gscService');

module.exports = function createAdminSearchConsoleRouter({ requireAdmin }) {
  const router = express.Router();

  let gscScheduleConfig = {
    enabled: false,
    batch_size: 50,
    interval_hours: 24,
    sync_range: '7d',
    last_run: null,
  };

  // Vista principal de Google Search Console
  router.get('/admin/search-console', requireAdmin, async (req, res) => {
    const selectedRange = gscService.normalizeRange(req.query.range || '').key;
    const activeRange = req.query.range ? selectedRange : null;
    const statusFilter = ['pending', 'used', 'all'].includes(req.query.status) ? req.query.status : 'pending';
    const search = String(req.query.search || '').trim();
    const sortBy = String(req.query.sort || 'impressions');
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = 100;
    const offset = (page - 1) * limit;

    let syncMessage = req.query.msg || '';
    let errorMessage = req.query.error || '';
    let syncMeta = await gscService.getSyncMeta();

    try {
      // Si el usuario eligió un rango concreto por clic directo o la BD está vacía, sincronizamos
      let stored = await gscService.getStoredQueries({
        status: statusFilter === 'all' ? '' : statusFilter,
        search,
        sortBy,
        limit,
        offset,
      });

      if (!errorMessage && (!stored.totals || Number(stored.totals.totalQueries) === 0)) {
        try {
          const syncRes = await gscService.syncQueriesToDatabase({
            range: activeRange || syncMeta.lastRange || '7d',
            limit: 1000,
            forceRefresh: true,
          });
          syncMeta = await gscService.getSyncMeta();
          syncMessage = syncMessage || `Sincronizadas ${syncRes.syncedCount} consultas (${syncRes.rangeLabel}: ${syncRes.startDate} → ${syncRes.endDate}).`;
          stored = await gscService.getStoredQueries({
            status: statusFilter === 'all' ? '' : statusFilter,
            search,
            sortBy,
            limit,
            offset,
          });
        } catch (syncErr) {
          errorMessage = syncErr.message;
        }
      }

      const currentRange = activeRange || syncMeta.lastRange || '7d';

      res.render('admin/search-console', {
        title: 'Google Search Console — DimePrecio.es',
        queries: stored.rows,
        totals: stored.totals,
        filteredTotal: stored.filteredTotal,
        pagination: {
          page,
          limit,
          totalPages: Math.max(1, Math.ceil((stored.filteredTotal || 0) / limit)),
        },
        filters: { status: statusFilter, search, sort: sortBy, range: currentRange },
        ranges: gscService.RANGE_LIST,
        syncMeta,
        scheduleConfig: gscScheduleConfig,
        syncMessage,
        error: errorMessage || syncMeta.lastError || '',
      });
    } catch (err) {
      console.error('[Search Console GET Error]', err);
      res.render('admin/search-console', {
        title: 'Google Search Console — DimePrecio.es',
        queries: [],
        totals: { totalQueries: 0, totalUsed: 0, totalPending: 0, totalImpressions: 0, totalClicks: 0 },
        filteredTotal: 0,
        pagination: { page: 1, limit, totalPages: 1 },
        filters: { status: statusFilter, search, sort: sortBy, range: activeRange || '7d' },
        ranges: gscService.RANGE_LIST,
        syncMeta,
        scheduleConfig: gscScheduleConfig,
        syncMessage: '',
        error: err.message,
      });
    }
  });

  // Sincronización manual con rango configurable (24h, 3d, 7d, 28d, 90d, 180d, 365d)
  router.post('/admin/search-console/sync', requireAdmin, async (req, res) => {
    const range = gscService.normalizeRange(req.body.range || req.query.range || '7d').key;
    const limit = Math.min(Math.max(Number(req.body.limit) || 1000, 100), 5000);
    try {
      const result = await gscService.syncQueriesToDatabase({
        range,
        limit,
        forceRefresh: true,
      });
      const msg = `✔ Sincronizadas ${result.syncedCount} consultas de ${result.rangeLabel} (${result.startDate} → ${result.endDate}) desde ${result.siteUrl}.`;
      return res.redirect(`/admin/search-console?range=${encodeURIComponent(range)}&msg=${encodeURIComponent(msg)}`);
    } catch (err) {
      console.error('[GSC Sync Manual Error]', err);
      return res.redirect(`/admin/search-console?range=${encodeURIComponent(range)}&error=${encodeURIComponent('Error sincronizando con Google: ' + err.message)}`);
    }
  });

  // Enviar lote de consultas a la Cola de Generación Masiva IA
  router.post('/admin/search-console/generate-batch', requireAdmin, async (req, res) => {
    try {
      const { queries, limit } = req.body || {};
      const result = await gscService.enqueuePendingBatch({
        queries: Array.isArray(queries) ? queries : [],
        limit: Number(limit) || 100,
      });
      if (!result.added) {
        return res.json({ ok: false, message: 'No hay consultas pendientes seleccionadas para procesar.' });
      }
      return res.json({
        ok: true,
        total: result.added,
        success: result.added,
        message: `Se han añadido ${result.added} tareas a la cola de generación IA.`,
      });
    } catch (err) {
      console.error('[GSC Generate Batch Error]', err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  // Guardar programación automática de sincronización + lotes
  router.post('/admin/search-console/schedule', requireAdmin, (req, res) => {
    const { enabled, batch_size, interval_hours, sync_range } = req.body || {};
    gscScheduleConfig = {
      enabled: enabled === '1',
      batch_size: Math.min(Math.max(Number(batch_size) || 50, 1), 200),
      interval_hours: Math.min(Math.max(Number(interval_hours) || 24, 1), 168),
      sync_range: gscService.normalizeRange(sync_range || '7d').key,
      last_run: gscScheduleConfig.last_run,
    };
    const msg = gscScheduleConfig.enabled
      ? `⏱ Auto-sincronización (${gscScheduleConfig.sync_range}) y lotes de ${gscScheduleConfig.batch_size} artículos activados cada ${gscScheduleConfig.interval_hours}h.`
      : 'Programación automática de Search Console desactivada.';
    res.redirect(`/admin/search-console?msg=${encodeURIComponent(msg)}`);
  });

  // Comprobador periódico en segundo plano (sincroniza GSC + encola lote si está activado)
  const timer = setInterval(async () => {
    if (!gscScheduleConfig.enabled) return;
    const now = Date.now();
    const intervalMs = (gscScheduleConfig.interval_hours || 24) * 3600 * 1000;
    if (!gscScheduleConfig.last_run || (now - new Date(gscScheduleConfig.last_run).getTime() > intervalMs)) {
      gscScheduleConfig.last_run = new Date().toISOString();
      try {
        await gscService.syncQueriesToDatabase({ range: gscScheduleConfig.sync_range || '7d', limit: 1000, forceRefresh: true });
        const enq = await gscService.enqueuePendingBatch({ limit: gscScheduleConfig.batch_size || 50 });
        console.log(`[GSC Auto-Schedule] Sincronizado (${gscScheduleConfig.sync_range}) y encolados ${enq.added} artículos.`);
      } catch (e) {
        console.error('[GSC Auto-Schedule Error]', e.message);
      }
    }
  }, 30 * 60 * 1000);
  if (timer.unref) timer.unref();

  return router;
};
