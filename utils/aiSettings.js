// Configuración del proveedor de IA (webhook propio, OpenAI, Claude o Gemini).
// Se guarda en la tabla app_settings (clave/valor) de la BD de producción y se cachea en memoria.

const db = require("../db");

const PROVIDERS = ["webhook", "openai", "anthropic", "gemini"];

const DEFAULTS = {
    provider: "webhook",
    webhookUrl: process.env.AI_WEBHOOK_URL || "https://n8n.legion.software/webhook/socialsForceLlm",
    openaiKey: process.env.OPENAI_API_KEY || "",
    openaiModel: "gpt-4o-mini",
    anthropicKey: process.env.ANTHROPIC_API_KEY || "",
    anthropicModel: "claude-sonnet-4-5",
    geminiKey: process.env.GEMINI_API_KEY || "",
    geminiModel: "gemini-2.5-flash",
    temperature: 0.7,
    maxTokens: 12000
};

const KEY_FIELDS = ["openaiKey", "anthropicKey", "geminiKey"];

let cache = null;
let tableReady = false;

async function ensureTable() {
    if (tableReady) return;
    await db.query(`
        CREATE TABLE IF NOT EXISTS app_settings (
            k VARCHAR(80) PRIMARY KEY,
            v TEXT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);
    tableReady = true;
}

async function getSettings() {
    if (cache) return cache;
    const settings = { ...DEFAULTS };
    try {
        await ensureTable();
        const [rows] = await db.query("SELECT k, v FROM app_settings WHERE k LIKE 'ai.%'");
        for (const row of rows) {
            const key = row.k.slice(3);
            if (key in DEFAULTS && row.v !== null && row.v !== "") settings[key] = row.v;
        }
    } catch (err) {
        console.error("[aiSettings] No se pudo leer la configuración:", err.message);
    }
    settings.temperature = Number(settings.temperature);
    if (!Number.isFinite(settings.temperature)) settings.temperature = DEFAULTS.temperature;
    settings.maxTokens = parseInt(settings.maxTokens, 10) || DEFAULTS.maxTokens;
    if (!PROVIDERS.includes(settings.provider)) settings.provider = "webhook";
    cache = settings;
    return settings;
}

// Guarda la configuración. Las claves vacías NO sobrescriben la clave existente
// (así el formulario puede mostrarlas enmascaradas). Usa "__clear__" para borrar una clave.
async function saveSettings(input = {}) {
    await ensureTable();
    const current = await getSettings();
    const next = { ...current };

    if (PROVIDERS.includes(input.provider)) next.provider = input.provider;
    for (const field of ["webhookUrl", "openaiModel", "anthropicModel", "geminiModel"]) {
        if (typeof input[field] === "string" && input[field].trim()) next[field] = input[field].trim();
    }
    for (const field of KEY_FIELDS) {
        const value = typeof input[field] === "string" ? input[field].trim() : "";
        if (value === "__clear__") next[field] = "";
        else if (value) next[field] = value;
    }
    const temp = Number(input.temperature);
    if (Number.isFinite(temp)) next.temperature = Math.min(2, Math.max(0, temp));
    const maxTokens = parseInt(input.maxTokens, 10);
    if (Number.isFinite(maxTokens)) next.maxTokens = Math.min(64000, Math.max(1000, maxTokens));

    for (const [key, value] of Object.entries(next)) {
        await db.query(
            "INSERT INTO app_settings (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)",
            [`ai.${key}`, String(value)]
        );
    }
    cache = next;
    return next;
}

function maskKey(key) {
    if (!key) return "";
    if (key.length <= 8) return "••••";
    return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

// Versión segura para enviar a la vista (sin claves completas)
async function getPublicSettings() {
    const s = await getSettings();
    return {
        ...s,
        openaiKey: maskKey(s.openaiKey),
        anthropicKey: maskKey(s.anthropicKey),
        geminiKey: maskKey(s.geminiKey),
        hasOpenaiKey: !!s.openaiKey,
        hasAnthropicKey: !!s.anthropicKey,
        hasGeminiKey: !!s.geminiKey
    };
}

module.exports = { getSettings, saveSettings, getPublicSettings, PROVIDERS, DEFAULTS };
