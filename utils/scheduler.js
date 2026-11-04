// Trabajos programados configurables desde el admin (Cron SEO Programático + Noticias IA).
// Soporta generación automática combinando [Sector] + [Provincia] + [Barrio/Problema frecuente]
// además del buscador de Google News (SerpApi) heredado de SocialsForce.

const { q, logError } = require("./safe");
const news = require("./news");
const ai = require("./ai");
const rankRent = require("./rankRentEngine");

const DEFAULT_CONFIG = {
    enabled: false,
    intervalMinutes: 120,   // mínimo 15
    query: "",              // palabras clave o problema frecuente
    country: "es",
    maxPerRun: 2,           // cuántos contenidos híbridos generar por ejecución (1-6)
    mode: "publish",        // "draft" | "publish"
    seoMatrixMode: true,    // Genera automáticamente Noticias Locales + Guías + Posts Sociales [Provincia x Sector]
    targetProvinciaId: 0,   // 0 = rotación automática por las 52 provincias
    targetSectorId: 0       // 0 = rotación automática por los 30 sectores
};

const MIN_INTERVAL = 15;
const MAX_INTERVAL = 1440;
const HISTORY_LIMIT = 30;

let memoryConfig = { ...DEFAULT_CONFIG };
let configLoaded = false;
let running = false;
let timer = null;
let memoryRuns = [];

async function ensureTables() {
    await q(`
        CREATE TABLE IF NOT EXISTS scheduled_tasks (
            id TINYINT PRIMARY KEY,
            config JSON NOT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `, [], null, "scheduler");

    await q(`
        CREATE TABLE IF NOT EXISTS scheduled_runs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            started_at DATETIME NOT NULL,
            finished_at DATETIME NULL,
            status VARCHAR(16) NOT NULL,
            found INT NOT NULL DEFAULT 0,
            published INT NOT NULL DEFAULT 0,
            log TEXT NULL,
            KEY idx_started (started_at)
        )
    `, [], null, "scheduler");

    await q(`
        CREATE TABLE IF NOT EXISTS scheduled_seen (
            link VARCHAR(512) PRIMARY KEY,
            seen_at DATETIME NOT NULL
        )
    `, [], null, "scheduler");
}

function sanitizeConfig(input) {
    const c = { ...DEFAULT_CONFIG };
    if (input && typeof input === "object") {
        c.enabled = input.enabled === true || input.enabled === "on" || input.enabled === 1 || input.enabled === "1";
        const interval = parseInt(input.intervalMinutes, 10);
        if (Number.isFinite(interval)) c.intervalMinutes = Math.min(MAX_INTERVAL, Math.max(MIN_INTERVAL, interval));
        c.query = String(input.query || "").trim().slice(0, 200);
        c.country = String(input.country || DEFAULT_CONFIG.country).trim().slice(0, 8).toLowerCase();
        const max = parseInt(input.maxPerRun, 10);
        if (Number.isFinite(max)) c.maxPerRun = Math.min(6, Math.max(1, max));
        c.mode = input.mode === "draft" ? "draft" : "publish";
        c.seoMatrixMode = input.seoMatrixMode === undefined ? true : (input.seoMatrixMode === true || input.seoMatrixMode === "on" || input.seoMatrixMode === "1");
        c.targetProvinciaId = parseInt(input.targetProvinciaId, 10) || 0;
        c.targetSectorId = parseInt(input.targetSectorId, 10) || 0;
    }
    return c;
}

async function getConfig() {
    if (configLoaded) return memoryConfig;
    const rows = await q(`SELECT config FROM scheduled_tasks WHERE id = 1 LIMIT 1`, [], null, "scheduler");
    if (rows && rows[0] && rows[0].config) {
        let stored = rows[0].config;
        if (typeof stored === "string") {
            try { stored = JSON.parse(stored); } catch { stored = {}; }
        }
        memoryConfig = sanitizeConfig(stored);
    }
    configLoaded = true;
    return memoryConfig;
}

async function saveConfig(input) {
    memoryConfig = sanitizeConfig(input);
    configLoaded = true;
    await q(`
        INSERT INTO scheduled_tasks (id, config) VALUES (1, ?)
        ON DUPLICATE KEY UPDATE config = VALUES(config)
    `, [JSON.stringify(memoryConfig)], null, "scheduler");
    scheduleNext();
    return memoryConfig;
}

async function runNow(trigger = "manual") {
    if (running) return { skipped: true, reason: "already-running" };
    running = true;

    const startedAt = new Date();
    const log = [];
    let found = 0;
    let published = 0;
    let status = "ok";

    try {
        const cfg = await getConfig();
        const locations = rankRent.getLocations();
        const sectors = rankRent.getSectors();

        if (cfg.seoMatrixMode) {
            found = cfg.maxPerRun;
            for (let i = 0; i < cfg.maxPerRun; i++) {
                const loc = cfg.targetProvinciaId
                    ? (rankRent.getLocationById(cfg.targetProvinciaId) || locations[0])
                    : locations[Math.floor(Math.random() * locations.length)];
                const sec = cfg.targetSectorId
                    ? (rankRent.getSectorById(cfg.targetSectorId) || sectors[0])
                    : sectors[Math.floor(Math.random() * sectors.length)];
                const barrio = loc.municipios[Math.floor(Math.random() * loc.municipios.length)] || loc.nombre;
                const type = i % 2 === 0 ? "news_guide" : "social_post";

                log.push(`[Matriz SEO] Generando ${type} para ${sec.nombre} en ${barrio} (${loc.nombre})...`);
                const created = await rankRent.generateHybridContent({
                    provinciaId: loc.id,
                    sectorId: sec.id,
                    type,
                    municipio: barrio,
                    problemaFrecuente: cfg.query || "",
                    useExternalAi: false
                });
                published++;
                log.push(`✔ Publicado: "${created.title}" -> ${created.url}`);
            }
        } else {
            const data = await news.searchNews(cfg.country, { query: cfg.query, num: 10 });
            const items = (Array.isArray(data.normalized) ? data.normalized : [])
                .filter(n => n.title && n.title !== "Sin título");
            found = items.length;
            let taken = 0;
            for (const item of items) {
                if (taken >= cfg.maxPerRun) break;
                try {
                    log.push(`Generando desde noticia: ${item.title}`);
                    const article = await ai.generateArticle(`Escribe artículo sobre: ${item.title}`);
                    await ai.insertArticle(article, { publishedAt: cfg.mode === "publish" ? new Date() : null });
                    published++;
                    taken++;
                    log.push(`✔ Publicado: ${article.title}`);
                } catch (err) {
                    status = published ? "partial" : "error";
                    log.push(`Error con "${item.title}": ${err.message}`);
                }
            }
        }
    } catch (error) {
        status = "error";
        log.push(`Error general: ${error.message}`);
        logError("scheduler", error);
    }

    const finishedAt = new Date();
    const runRecord = {
        id: Date.now(),
        started_at: startedAt.toISOString(),
        finished_at: finishedAt.toISOString(),
        status,
        found,
        published,
        log
    };
    memoryRuns.unshift(runRecord);
    if (memoryRuns.length > HISTORY_LIMIT) memoryRuns.length = HISTORY_LIMIT;

    await q(`
        INSERT INTO scheduled_runs (started_at, finished_at, status, found, published, log)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [startedAt, finishedAt, status, found, published, JSON.stringify(log)], null, "scheduler");

    running = false;
    return { status, found, published, log, trigger, startedAt, finishedAt };
}

async function tick() {
    const cfg = await getConfig();
    if (!cfg.enabled) return;
    const result = await runNow("auto");
    if (result && result.skipped) return;
    scheduleNext();
}

function scheduleNext() {
    clearTimeout(timer);
    timer = null;
    getConfig().then(cfg => {
        if (!cfg.enabled) return;
        timer = setTimeout(() => { tick(); }, cfg.intervalMinutes * 60e3);
        if (timer.unref) timer.unref();
    }).catch(error => logError("scheduler", error));
}

async function start() {
    await ensureTables();
    await getConfig();
    scheduleNext();
}

async function status() {
    const cfg = await getConfig();
    const runs = await q(`
        SELECT id, started_at, finished_at, status, found, published, log
        FROM scheduled_runs ORDER BY started_at DESC LIMIT ${HISTORY_LIMIT}
    `, [], [], "scheduler");

    const parsedRuns = (runs && runs.length ? runs : memoryRuns).map(r => {
        let log = r.log;
        if (typeof log === "string") {
            try { log = JSON.parse(log || "[]"); } catch { log = []; }
        }
        return { ...r, log: Array.isArray(log) ? log : [] };
    });

    return {
        config: cfg,
        running,
        runs: parsedRuns,
        lastRun: parsedRuns[0] || null
    };
}

module.exports = { start, runNow, status, getConfig, saveConfig, DEFAULT_CONFIG };
