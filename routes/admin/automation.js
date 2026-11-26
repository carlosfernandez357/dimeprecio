// ============================================================================
// Rutas Admin: Automatización IA (Cola Masiva + Recorrido Ciudades × Servicios)
// ============================================================================
const express = require('express');
const articleQueue = require('../../utils/articleQueue');
const cityServiceLoop = require('../../utils/cityServiceLoop');
const rr = require('../../utils/rankRentEngine');

module.exports = function createAdminAutomationRouter({ requireAdmin }) {
  const router = express.Router();

  // --------------------------------------------------------------------------
  // 1. COLA DE ARTÍCULOS IA (GRAN ESCALA)
  // --------------------------------------------------------------------------
  router.get('/admin/cola-articulos', requireAdmin, async (req, res) => {
    try {
      const currentStatus = req.query.status || null;
      const stats = await articleQueue.getQueueStats();
      const queueResult = await articleQueue.getQueueItems({ status: currentStatus, limit: 300 });
      const loopState = await cityServiceLoop.getDashboardState({ limit: 10 }).catch(() => null);

      res.render('admin/article-queue', {
        title: 'Cola de Generación Masiva IA — DimePrecio.es',
        items: queueResult.rows || [],
        stats,
        currentStatus,
        workerPaused: Boolean(queueResult.workerPaused),
        isWorkerRunning: Boolean(queueResult.isWorkerRunning),
        loopState,
      });
    } catch (err) {
      console.error('[Admin Cola Artículos Error]', err);
      res.status(500).send('Error al cargar la cola de artículos: ' + err.message);
    }
  });

  router.post('/admin/cola-articulos/pause', requireAdmin, (req, res) => {
    articleQueue.pauseWorker();
    res.redirect('/admin/cola-articulos');
  });

  router.post('/admin/cola-articulos/resume', requireAdmin, (req, res) => {
    articleQueue.resumeWorker();
    res.redirect('/admin/cola-articulos');
  });

  router.post('/admin/cola-articulos/add', requireAdmin, async (req, res) => {
    try {
      const { prompts, defaultProvincia, defaultSector } = req.body || {};
      if (prompts && typeof prompts === 'string') {
        const rawLines = prompts.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
        for (const line of rawLines) {
          await articleQueue.addToQueue({
            prompt: line,
            provincia_slug: defaultProvincia || null,
            sector_slug: defaultSector || null,
          });
        }
        articleQueue.triggerWorker();
      }
      res.redirect('/admin/cola-articulos');
    } catch (err) {
      console.error('[Cola Add Error]', err);
      res.redirect('/admin/cola-articulos?error=' + encodeURIComponent(err.message));
    }
  });

  router.post('/admin/cola-articulos/process', requireAdmin, (req, res) => {
    try {
      articleQueue.triggerWorker();
    } catch (err) {
      console.error('[Cola Process Error]', err);
    }
    res.redirect('/admin/cola-articulos');
  });

  router.post('/admin/cola-articulos/:id/delete', requireAdmin, async (req, res) => {
    try {
      await articleQueue.deleteQueueItem(req.params.id);
    } catch (err) {
      console.error('[Cola Delete Item Error]', err);
    }
    res.redirect('/admin/cola-articulos');
  });

  router.post('/admin/cola-articulos/:id/retry', requireAdmin, async (req, res) => {
    try {
      await articleQueue.retryQueueItems([req.params.id]);
      articleQueue.triggerWorker();
    } catch (err) {
      console.error('[Cola Retry Item Error]', err);
    }
    res.redirect('/admin/cola-articulos');
  });

  router.post('/admin/cola-articulos/:id/edit', requireAdmin, async (req, res) => {
    try {
      const { prompt, custom_title, provincia_slug, sector_slug } = req.body || {};
      await articleQueue.editQueueItem(req.params.id, {
        prompt,
        custom_title,
        provincia_slug,
        sector_slug,
      });
    } catch (err) {
      console.error('[Cola Edit Item Error]', err);
    }
    res.redirect('/admin/cola-articulos');
  });

  router.post('/admin/cola-articulos/bulk-action', requireAdmin, async (req, res) => {
    try {
      const { action, ids } = req.body || {};
      const idList = Array.isArray(ids) ? ids : (ids ? [ids] : []);
      if (idList.length > 0) {
        if (action === 'delete') {
          await articleQueue.deleteBulkQueueItems(idList);
        } else if (action === 'retry') {
          await articleQueue.retryQueueItems(idList);
          articleQueue.triggerWorker();
        }
      }
    } catch (err) {
      console.error('[Cola Bulk Action Error]', err);
    }
    res.redirect('/admin/cola-articulos');
  });

  // --------------------------------------------------------------------------
  // 2. RECORRIDO EN BUCLE: CIUDADES × SERVICIOS (NOTICIAS + TENDENCIAS + IA)
  // --------------------------------------------------------------------------
  router.get('/admin/recorrido-ciudades', requireAdmin, async (req, res) => {
    try {
      const filters = {
        status: req.query.status || '',
        provincia: req.query.provincia || '',
        sector: req.query.sector || '',
        search: req.query.search || '',
        page: parseInt(req.query.page, 10) || 1,
      };
      const state = await cityServiceLoop.getDashboardState({
        filterStatus: filters.status,
        filterProvincia: filters.provincia,
        filterSector: filters.sector,
        search: filters.search,
        page: filters.page,
        limit: 60,
      });
      res.render('admin/city-service-loop', {
        title: 'Recorrido Ciudades × Servicios — DimePrecio.es',
        state,
        filters,
        flashMsg: req.query.msg || '',
        allLocations: rr.getLocations(false),
        allSectors: rr.getSectors(false),
      });
    } catch (err) {
      console.error('[Recorrido Ciudades GET Error]', err);
      res.status(500).render('error', { title: 'Error', message: 'Error cargando el recorrido de ciudades: ' + err.message });
    }
  });

  router.get('/admin/recorrido-ciudades/status', requireAdmin, async (req, res) => {
    try {
      const state = await cityServiceLoop.getDashboardState({ limit: 10 });
      res.json({
        success: true,
        config: state.config,
        stats: state.stats,
        currentItem: state.currentItem,
        nextItems: state.nextItems,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/admin/recorrido-ciudades/start', requireAdmin, async (req, res) => {
    try {
      await cityServiceLoop.startLoop({ runImmediately: true });
      res.redirect('/admin/recorrido-ciudades?msg=' + encodeURIComponent('▶ Recorrido automático iniciado. Generando siguiente artículo...'));
    } catch (err) {
      res.redirect('/admin/recorrido-ciudades?msg=' + encodeURIComponent('Error al iniciar: ' + err.message));
    }
  });

  router.post('/admin/recorrido-ciudades/pause', requireAdmin, async (req, res) => {
    try {
      await cityServiceLoop.pauseLoop();
      res.redirect('/admin/recorrido-ciudades?msg=' + encodeURIComponent('⏸ Recorrido pausado. Puedes reanudarlo exactamente en este punto cuando quieras.'));
    } catch (err) {
      res.redirect('/admin/recorrido-ciudades?msg=' + encodeURIComponent('Error al pausar: ' + err.message));
    }
  });

  router.post('/admin/recorrido-ciudades/run-step', requireAdmin, async (req, res) => {
    try {
      const result = await cityServiceLoop.runNextStep({ manual: true });
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/admin/recorrido-ciudades/skip', requireAdmin, async (req, res) => {
    try {
      const result = await cityServiceLoop.skipItem(null);
      const msg = result.skipped
        ? `⏭ Saltado: ${result.item.provincia_nombre} · ${result.item.sector_nombre}`
        : 'No había elementos pendientes para saltar.';
      res.redirect('/admin/recorrido-ciudades?msg=' + encodeURIComponent(msg));
    } catch (err) {
      res.redirect('/admin/recorrido-ciudades?msg=' + encodeURIComponent('Error al saltar: ' + err.message));
    }
  });

  router.post('/admin/recorrido-ciudades/item/:id/skip', requireAdmin, async (req, res) => {
    try {
      await cityServiceLoop.skipItem(req.params.id);
      res.redirect('/admin/recorrido-ciudades?msg=' + encodeURIComponent('Elemento marcado como saltado.'));
    } catch (err) {
      res.redirect('/admin/recorrido-ciudades?msg=' + encodeURIComponent('Error: ' + err.message));
    }
  });

  router.post('/admin/recorrido-ciudades/item/:id/retry', requireAdmin, async (req, res) => {
    try {
      await cityServiceLoop.retryFailed(req.params.id);
      res.redirect('/admin/recorrido-ciudades?msg=' + encodeURIComponent('Elemento devuelto a pendientes para reintentar.'));
    } catch (err) {
      res.redirect('/admin/recorrido-ciudades?msg=' + encodeURIComponent('Error: ' + err.message));
    }
  });

  router.post('/admin/recorrido-ciudades/retry-failed', requireAdmin, async (req, res) => {
    try {
      const resRetry = await cityServiceLoop.retryFailed(null);
      res.redirect('/admin/recorrido-ciudades?msg=' + encodeURIComponent(`🔄 ${resRetry.retried} elementos fallidos devueltos a pendientes.`));
    } catch (err) {
      res.redirect('/admin/recorrido-ciudades?msg=' + encodeURIComponent('Error: ' + err.message));
    }
  });

  router.post('/admin/recorrido-ciudades/jump-city', requireAdmin, async (req, res) => {
    try {
      const result = await cityServiceLoop.jumpToCity(req.body.provincia_slug);
      const msg = result.jumped
        ? `🎯 Puntero movido a ${result.provincia_nombre} (Paso #${result.step_index + 1}).`
        : (result.message || 'No se pudo mover a esa ciudad.');
      res.redirect('/admin/recorrido-ciudades?msg=' + encodeURIComponent(msg));
    } catch (err) {
      res.redirect('/admin/recorrido-ciudades?msg=' + encodeURIComponent('Error: ' + err.message));
    }
  });

  router.post('/admin/recorrido-ciudades/config', requireAdmin, async (req, res) => {
    try {
      await cityServiceLoop.updateConfig({
        interval_seconds: req.body.interval_seconds,
        order_mode: req.body.order_mode,
        content_mode: req.body.content_mode,
        auto_publish: req.body.auto_publish === '1',
        loop_forever: req.body.loop_forever === '1',
        use_fallback: req.body.use_fallback === '1',
      });
      res.redirect('/admin/recorrido-ciudades?msg=' + encodeURIComponent('💾 Configuración guardada correctamente.'));
    } catch (err) {
      res.redirect('/admin/recorrido-ciudades?msg=' + encodeURIComponent('Error guardando configuración: ' + err.message));
    }
  });

  router.post('/admin/recorrido-ciudades/reset', requireAdmin, async (req, res) => {
    try {
      const nextCycle = req.body.next_cycle === '1';
      const cfg = await cityServiceLoop.resetCycle({ nextCycle });
      const msg = nextCycle
        ? `🚀 Nueva Vuelta #${cfg.cycle_number} preparada con todas las ciudades y servicios.`
        : `🔁 Vuelta #${cfg.cycle_number} reiniciada desde el principio.`;
      res.redirect('/admin/recorrido-ciudades?msg=' + encodeURIComponent(msg));
    } catch (err) {
      res.redirect('/admin/recorrido-ciudades?msg=' + encodeURIComponent('Error al reiniciar: ' + err.message));
    }
  });

  return router;
};
