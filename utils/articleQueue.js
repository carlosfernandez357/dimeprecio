// ============================================================================
// DimePrecio.es — Gestor de Cola de Generación Masiva de Artículos IA
// ============================================================================
const pool = require('../db');
const rr = require('./rankRentEngine');
const ai = require('./ai');
const imageManager = require('./imageManager');
const semanticMatcher = require('./semanticMatcher');

let isWorkerRunning = false;
let workerPaused = false;

async function ensureQueueTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS article_generation_queue (
      id INT AUTO_INCREMENT PRIMARY KEY,
      prompt VARCHAR(255) NOT NULL,
      provincia_slug VARCHAR(60) DEFAULT 'madrid',
      sector_slug VARCHAR(80) DEFAULT 'reformas-integrales',
      custom_title VARCHAR(255) NULL,
      status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
      post_id INT NULL,
      error_message TEXT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      processed_at DATETIME NULL,
      INDEX idx_status (status),
      INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

/**
 * Añade una tarea a la cola de generación.
 */
async function addToQueue({ prompt, provincia_slug = null, sector_slug = null, custom_title = null }) {
  await ensureQueueTable();
  const text = String(prompt || '').trim();
  if (!text) throw new Error('El tema o prompt no puede estar vacío');

  const match = semanticMatcher.detectProvinceAndSector(text, provincia_slug, sector_slug);
  const prov = provincia_slug || match.provincia_slug;
  const sec = sector_slug || match.sector_slug;

  const [ins] = await pool.query(
    `INSERT INTO article_generation_queue (prompt, provincia_slug, sector_slug, custom_title, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [text, prov, sec, custom_title || null]
  );

  // Iniciar worker en segundo plano si no está corriendo
  triggerWorker();
  return ins.insertId;
}

/**
 * Añade múltiples tareas a la cola de generación.
 */
async function addBulkToQueue(items = []) {
  await ensureQueueTable();
  if (!Array.isArray(items) || items.length === 0) return { added: 0 };

  let added = 0;
  for (const item of items) {
    const text = typeof item === 'string' ? item.trim() : String(item.prompt || '').trim();
    if (!text) continue;

    const match = semanticMatcher.detectProvinceAndSector(
      text,
      typeof item === 'object' ? item.provincia_slug : null,
      typeof item === 'object' ? item.sector_slug : null
    );

    const prov = (typeof item === 'object' && item.provincia_slug) ? item.provincia_slug : match.provincia_slug;
    const sec = (typeof item === 'object' && item.sector_slug) ? item.sector_slug : match.sector_slug;
    const customTitle = (typeof item === 'object' && item.custom_title) ? item.custom_title : null;

    try {
      await pool.query(
        `INSERT INTO article_generation_queue (prompt, provincia_slug, sector_slug, custom_title, status)
         VALUES (?, ?, ?, ?, 'pending')`,
        [text, prov, sec, customTitle]
      );
      added++;
    } catch (e) {
      console.error('[Queue Add Error]', text, e.message);
    }
  }

  triggerWorker();
  return { added };
}

/**
 * Obtiene los elementos de la cola con filtros y conteos.
 */
async function getQueueItems({ status = '', search = '', limit = 100, offset = 0 } = {}) {
  await ensureQueueTable();

  let where = ['1=1'];
  const params = [];

  if (status && ['pending', 'processing', 'completed', 'failed'].includes(status)) {
    where.push('status = ?');
    params.push(status);
  }

  if (search && search.trim()) {
    where.push('(prompt LIKE ? OR custom_title LIKE ?)');
    params.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }

  const whereSql = where.join(' AND ');

  const [rows] = await pool.query(
    `SELECT q.*, p.slug as post_slug 
     FROM article_generation_queue q
     LEFT JOIN posts p ON q.post_id = p.id
     WHERE ${whereSql} 
     ORDER BY q.id DESC 
     LIMIT ? OFFSET ?`,
    [...params, Number(limit) || 100, Number(offset) || 0]
  );

  const [[counts]] = await pool.query(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingCount,
      SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processingCount,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedCount,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failedCount
    FROM article_generation_queue
  `);

  return {
    rows: rows || [],
    counts: counts || { total: 0, pendingCount: 0, processingCount: 0, completedCount: 0, failedCount: 0 },
    isWorkerRunning,
    workerPaused,
  };
}

/**
 * Elimina un elemento de la cola.
 */
async function deleteQueueItem(id) {
  await ensureQueueTable();
  await pool.query('DELETE FROM article_generation_queue WHERE id = ?', [id]);
  return true;
}

/**
 * Elimina múltiples elementos de la cola.
 */
async function deleteBulkQueueItems(ids = []) {
  await ensureQueueTable();
  if (!Array.isArray(ids) || ids.length === 0) return { deleted: 0 };
  const [res] = await pool.query('DELETE FROM article_generation_queue WHERE id IN (?)', [ids]);
  return { deleted: res.affectedRows };
}

/**
 * Edita un elemento pendiente de la cola.
 */
async function editQueueItem(id, { prompt, provincia_slug, sector_slug, custom_title }) {
  await ensureQueueTable();
  await pool.query(
    `UPDATE article_generation_queue 
     SET prompt = COALESCE(?, prompt),
         provincia_slug = COALESCE(?, provincia_slug),
         sector_slug = COALESCE(?, sector_slug),
         custom_title = ?
     WHERE id = ?`,
    [prompt || null, provincia_slug || null, sector_slug || null, custom_title || null, id]
  );
  return true;
}

/**
 * Reintenta una o varias tareas fallidas o canceladas.
 */
async function retryQueueItems(ids = []) {
  await ensureQueueTable();
  if (!Array.isArray(ids) || ids.length === 0) return { retried: 0 };
  const [res] = await pool.query(
    "UPDATE article_generation_queue SET status = 'pending', error_message = NULL WHERE id IN (?)",
    [ids]
  );
  triggerWorker();
  return { retried: res.affectedRows };
}

/**
 * Procesa un elemento de la cola.
 */
async function processQueueItem(item) {
  await pool.query("UPDATE article_generation_queue SET status = 'processing' WHERE id = ?", [item.id]);

  try {
    const text = String(item.prompt || '').trim();
    const match = semanticMatcher.detectProvinceAndSector(text, item.provincia_slug, item.sector_slug);

    let provSlug = item.provincia_slug || match.provincia_slug;
    let secSlug = item.sector_slug || match.sector_slug;
    const sector = rr.getSectorBySlug(secSlug) || match.sector;
    const province = rr.getLocationBySlug(provSlug) || match.province;

    const generated = await ai.generateArticle(text, {
      provinciaSlug: provSlug,
      sectorSlug: secSlug,
      category: sector.nombre,
    });

    // Sincronizar título y provincia para que jamás choquen
    const rawTitle = item.custom_title || generated.title || semanticMatcher.generateDynamicTitle(text, province.nombre);
    provSlug = semanticMatcher.syncTitleAndProvince(rawTitle, provSlug);
    const finalProvince = rr.getLocationBySlug(provSlug) || province;
    const finalSector = rr.getSectorBySlug(secSlug) || sector;

    const title = rawTitle;
    const slug = (generated.slug || rr.slugify(text)) + '-' + Date.now().toString(36);
    const excerpt = generated.excerpt || generated.meta_description || `Análisis local y precios de ${finalSector.nombre} en ${finalProvince.nombre} en DimePrecio.es.`;
    const content = generated.content || `<p>Información detallada sobre ${text}.</p>`;
    const featured_image = generated.image || imageManager.getRandomFallbackImage(slug);

    const [ins] = await pool.query(
      `INSERT INTO posts (title, slug, excerpt, content, featured_image, image_alt, category_id, author_id, status, is_featured, is_breaking, meta_title, meta_description, keywords, published_at, provincia_slug, provincia_nombre, sector_slug, sector_nombre, municipio_tag)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', 1, 0, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        excerpt,
        content,
        featured_image,
        title,
        1,
        1,
        generated.meta_title || title,
        generated.meta_description || excerpt,
        generated.keywords || text,
        provSlug,
        finalProvince.nombre,
        secSlug,
        finalSector.nombre,
        finalProvince.nombre
      ]
    );

    const postId = ins.insertId;

    if (postId) {
      rr.updatePostAlgorithmSettings(postId, {
        is_pinned: 0,
        is_selected: 1,
        priority_weight: 9,
        provincia_slug: provSlug,
        sector_slug: secSlug,
      });

      await ai.savePostExtras(postId, {
        evergreen: 9,
        depth: 8,
        provincia_slug: provSlug,
        sector_slug: secSlug,
        topics: generated.topicsString || `${sector.nombre}:9`,
        tags: generated.keywords || text,
        content,
      });

      // Si existe en gsc_queries, marcarlo como usado
      try {
        const gsc = require('./gscService');
        await gsc.markQueryUsed(text);
      } catch (e) {
        // silencioso
      }
    }

    await pool.query(
      "UPDATE article_generation_queue SET status = 'completed', post_id = ?, processed_at = NOW() WHERE id = ?",
      [postId, item.id]
    );

    return { ok: true, postId, title, slug };
  } catch (err) {
    console.error(`[Queue Item #${item.id} Error]`, err.message);
    await pool.query(
      "UPDATE article_generation_queue SET status = 'failed', error_message = ?, processed_at = NOW() WHERE id = ?",
      [err.message.substring(0, 500), item.id]
    );
    throw err;
  }
}

/**
 * Worker en segundo plano para procesar la cola secuencialmente.
 */
function triggerWorker() {
  if (isWorkerRunning || workerPaused) return;
  isWorkerRunning = true;

  setImmediate(async () => {
    while (!workerPaused) {
      try {
        const [rows] = await pool.query(
          "SELECT * FROM article_generation_queue WHERE status = 'pending' ORDER BY id ASC LIMIT 1"
        );
        if (!rows || rows.length === 0) {
          break; // Cola vacía
        }

        const item = rows[0];
        console.log(`[Queue Worker] Procesando item #${item.id}: "${item.prompt}"...`);
        try {
          await processQueueItem(item);
          console.log(`[Queue Worker] Item #${item.id} finalizado con éxito.`);
        } catch (e) {
          console.error(`[Queue Worker] Item #${item.id} falló:`, e.message);
        }

        // Pausa de 3 segundos entre generaciones para no saturar APIs
        await new Promise(r => setTimeout(r, 3000));
      } catch (loopErr) {
        console.error('[Queue Worker Loop Error]', loopErr.message);
        break;
      }
    }
    isWorkerRunning = false;
  });
}

function pauseWorker() {
  workerPaused = true;
}

function resumeWorker() {
  workerPaused = false;
  triggerWorker();
}

async function getQueueStats() {
  await ensureQueueTable();
  const [[counts]] = await pool.query(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
    FROM article_generation_queue
  `);
  return {
    total: Number(counts?.total || 0),
    pending: Number(counts?.pending || 0),
    processing: Number(counts?.processing || 0),
    completed: Number(counts?.completed || 0),
    failed: Number(counts?.failed || 0),
  };
}

module.exports = {
  ensureQueueTable,
  addToQueue,
  addBulkToQueue,
  getQueueItems,
  getQueueStats,
  deleteQueueItem,
  deleteBulkQueueItems,
  editQueueItem,
  retryQueueItems,
  triggerWorker,
  pauseWorker,
  resumeWorker,
  processQueueItem,
};