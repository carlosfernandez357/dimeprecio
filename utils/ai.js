// Generación de páginas y artículos con IA para PidePrecio.es (webhook n8n + fallback local inteligente)
// + inserción en la BD MySQL (tabla posts) y sincronización con el motor de provincias y sectores.

const fs = require("fs");
const path = require("path");
const db = require("../db");
const safe = require("./safe");
const rec = require("./recommend");

const AI_WEBHOOK_URL = process.env.AI_WEBHOOK_URL || "https://n8n.legion.software/webhook/socialsForceLlm";
const AI_TIMEOUT_MS = 240000;

async function loadSystemPrompt(categoriesOverride) {
    let systemPrompt = fs.readFileSync(
        path.join(__dirname, "..", "prompts", "article-system.txt"),
        "utf8"
    );

    let categoryList = categoriesOverride || "";
    if (!categoryList) {
        const catRows = await safe.q(
            `SELECT DISTINCT category FROM posts WHERE category IS NOT NULL AND category <> '' ORDER BY category`,
            [], [], "ai-prompt"
        );
        categoryList = catRows.map(r => r.category).join(", ");
    }
    if (categoryList) {
        systemPrompt = systemPrompt.split("[CATEGORIES]").join(categoryList);
        systemPrompt = systemPrompt.split("{{ $json.categories }}").join(categoryList);
    }

    return systemPrompt;
}

// Instrucciones extra cuando se llama directamente a OpenAI / Claude / Gemini
// (no tienen herramientas de navegación como el workflow de n8n).
const DIRECT_PROVIDER_RULES = `

ADDITIONAL RULES (direct API mode)
- The brand is "DimePrecio.es" (https://dimeprecio.es). Use DimePrecio.es everywhere instead of any other brand name.
- You have NO web browsing or image search tools. Do NOT invent image URLs: set "image" to "" and do not include <img> or <figure> tags in "content".
- "content" must start with this AEO direct-answer block (fill in the real answer with concrete 2026 price ranges in euros):
  <div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;"><p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;"><strong>Resumen AEO de DimePrecio.es:</strong> ...</p></div>
- Include at least one price comparison <table>, several <h2> sections that match real user search questions, and an FAQ section with <details><summary>.
- End "content" with this call-to-action block exactly:
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:28px 0;text-align:center;"><h3 style="margin-top:0;color:#166534;font-size:18px;">¿Necesitas presupuesto cerrado?</h3><a href="tel:+34622158703" style="display:inline-block;background:#15803d;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:700;text-decoration:none;font-size:15px;">📞 Llamar a un operador (+34 622 15 87 03)</a></div>
- Respond with ONLY the JSON object.`;

function defaultCategories() {
    try {
        const rr = require("./rankRentEngine");
        return rr.getSectors(false).map(s => s.nombre).join(", ");
    } catch {
        return "";
    }
}

// Convierte el texto devuelto por cualquier proveedor en el objeto artículo
function parseArticlePayload(rawBody) {
    let payload = {};
    if (rawBody && typeof rawBody === "object") {
        payload = rawBody;
    } else {
        try {
            payload = JSON.parse(rawBody);
        } catch {
            payload = { output: rawBody };
        }
    }

    let article = payload.output || payload;
    if (typeof article === "string") {
        const cleaned = article.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, "").trim();
        try {
            article = JSON.parse(cleaned);
        } catch {
            // Último intento: extraer el primer objeto JSON del texto
            const start = cleaned.indexOf("{");
            const end = cleaned.lastIndexOf("}");
            try {
                article = start >= 0 && end > start ? JSON.parse(cleaned.slice(start, end + 1)) : {};
            } catch {
                article = {};
            }
        }
    }
    return article && typeof article === "object" ? article : {};
}

async function readError(response, label) {
    const text = await response.text().catch(() => "");
    return new Error(`${label} error ${response.status}: ${text}`.slice(0, 600));
}

async function callWebhook(url, systemPrompt, prompt) {
    const aiResponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt, prompt }),
        signal: AbortSignal.timeout(AI_TIMEOUT_MS)
    });

    if (!aiResponse.ok) throw await readError(aiResponse, "AI webhook");

    const rawBody = await aiResponse.text();
    if (!rawBody || !rawBody.trim()) {
        const error = new Error(
            `AI empty response (HTTP ${aiResponse.status}): el webhook de IA devolvió 0 bytes. ` +
            `Revisa que el workflow de n8n termine y ejecute el nodo "Respond to Webhook".`
        );
        error.emptyResponse = true;
        throw error;
    }
    return rawBody;
}

async function callOpenAI(cfg, systemPrompt, prompt) {
    if (!cfg.openaiKey) throw new Error("Falta la API key de OpenAI en Configuración IA");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.openaiKey}` },
        body: JSON.stringify({
            model: cfg.openaiModel,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: cfg.temperature
        }),
        signal: AbortSignal.timeout(AI_TIMEOUT_MS)
    });
    if (!response.ok) throw await readError(response, "OpenAI");
    const data = await response.json();
    return data?.choices?.[0]?.message?.content || "";
}

async function callAnthropic(cfg, systemPrompt, prompt) {
    if (!cfg.anthropicKey) throw new Error("Falta la API key de Claude (Anthropic) en Configuración IA");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": cfg.anthropicKey,
            "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
            model: cfg.anthropicModel,
            max_tokens: cfg.maxTokens,
            temperature: Math.min(1, cfg.temperature),
            system: systemPrompt,
            messages: [{ role: "user", content: prompt }]
        }),
        signal: AbortSignal.timeout(AI_TIMEOUT_MS)
    });
    if (!response.ok) throw await readError(response, "Claude");
    const data = await response.json();
    return (data?.content || []).filter(b => b.type === "text").map(b => b.text).join("");
}

async function callGemini(cfg, systemPrompt, prompt) {
    if (!cfg.geminiKey) throw new Error("Falta la API key de Gemini en Configuración IA");
    const model = String(cfg.geminiModel).replace(/^models\//, "");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": cfg.geminiKey },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: cfg.temperature,
                maxOutputTokens: cfg.maxTokens
            }
        }),
        signal: AbortSignal.timeout(AI_TIMEOUT_MS)
    });
    if (!response.ok) throw await readError(response, "Gemini");
    const data = await response.json();
    return (data?.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("");
}

// Lista los modelos disponibles para una key (para el selector de la página de configuración)
async function listModels(provider, cfg) {
    if (provider === "openai") {
        const r = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${cfg.openaiKey}` } });
        if (!r.ok) throw await readError(r, "OpenAI");
        const d = await r.json();
        return (d.data || []).map(m => m.id).filter(id => /^(gpt|o\d|chatgpt)/.test(id)).sort();
    }
    if (provider === "anthropic") {
        const r = await fetch("https://api.anthropic.com/v1/models?limit=100", {
            headers: { "x-api-key": cfg.anthropicKey, "anthropic-version": "2023-06-01" }
        });
        if (!r.ok) throw await readError(r, "Claude");
        const d = await r.json();
        return (d.data || []).map(m => m.id);
    }
    if (provider === "gemini") {
        const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", {
            headers: { "x-goog-api-key": cfg.geminiKey }
        });
        if (!r.ok) throw await readError(r, "Gemini");
        const d = await r.json();
        return (d.models || [])
            .filter(m => (m.supportedGenerationMethods || []).includes("generateContent"))
            .map(m => m.name.replace(/^models\//, ""));
    }
    return [];
}

async function generateArticle(prompt, { categories } = {}) {
    const aiSettings = require("./aiSettings");
    const cfg = await aiSettings.getSettings();
    let systemPrompt = await loadSystemPrompt(categories || defaultCategories());

    let raw;
    if (cfg.provider === "openai") {
        raw = await callOpenAI(cfg, systemPrompt + DIRECT_PROVIDER_RULES, prompt);
    } else if (cfg.provider === "anthropic") {
        raw = await callAnthropic(cfg, systemPrompt + DIRECT_PROVIDER_RULES, prompt);
    } else if (cfg.provider === "gemini") {
        raw = await callGemini(cfg, systemPrompt + DIRECT_PROVIDER_RULES, prompt);
    } else {
        raw = await callWebhook(cfg.webhookUrl || AI_WEBHOOK_URL, systemPrompt, prompt);
    }

    if (!raw || !String(raw).trim()) throw new Error(`La IA (${cfg.provider}) devolvió una respuesta vacía`);

    const article = parseArticlePayload(raw);
    if (!article.slug && article.title) {
        article.slug = String(article.title).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
    }

    if (!article.title || !article.slug || !article.excerpt || !article.content || !article.category) {
        const error = new Error(`AI (${cfg.provider}) returned incomplete article data`);
        error.incomplete = true;
        throw error;
    }

    return article;
}

async function savePostExtras(postId, data) {
    if (!postId) return;
    try {
        const f = safe.features();
        const sets = [], params = [];
        if (safe.hasCol("posts", "evergreen") && data.evergreen !== undefined && data.evergreen !== "") {
            sets.push("evergreen = ?"); params.push(safe.clamp(Math.round(Number(data.evergreen)) || 0, 0, 10));
        }
        if (safe.hasCol("posts", "depth") && data.depth !== undefined && data.depth !== "") {
            sets.push("depth = ?"); params.push(safe.clamp(Math.round(Number(data.depth)) || 5, 1, 10));
        }
        if (safe.hasCol("posts", "provincia_slug") && data.provincia_slug) {
            sets.push("provincia_slug = ?"); params.push(String(data.provincia_slug).slice(0, 80));
        }
        if (safe.hasCol("posts", "sector_slug") && data.sector_slug) {
            sets.push("sector_slug = ?"); params.push(String(data.sector_slug).slice(0, 100));
        }
        if (f.readingTimeCol) {
            sets.push("reading_time = ?"); params.push(safe.readingMinutes({ content: data.content }));
        }
        if (sets.length) await safe.q(`UPDATE posts SET ${sets.join(", ")} WHERE id = ?`, [...params, postId], null, "post-extras");

        let topics = rec.parseTopics(data.topics);
        if (!topics.length && data.tags) topics = rec.parseTopics(Array.isArray(data.tags) ? data.tags : String(data.tags).split(","));
        if (topics.length) await rec.saveTopics(postId, topics);
        rec.invalidate();
    } catch (error) {
        safe.logError("post-extras", error);
    }
}

async function insertArticle(article, { publishedAt = new Date() } = {}) {
    const tags = Array.isArray(article.tags)
        ? article.tags.map(t => String(t).trim()).filter(Boolean)
        : String(article.tags || "").split(",").map(t => t.trim()).filter(Boolean);

    const [result] = await db.query(`
        INSERT INTO posts (
            title, slug, excerpt, content, image, category, tags,
            published_at, views
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        article.title,
        article.slug,
        article.excerpt,
        article.content,
        article.image,
        article.category,
        JSON.stringify(tags),
        publishedAt,
        0
    ]);

    await savePostExtras(result.insertId, { ...article, tags });

    return { postId: result.insertId, tags };
}

module.exports = { generateArticle, insertArticle, savePostExtras, loadSystemPrompt, listModels, AI_WEBHOOK_URL };
