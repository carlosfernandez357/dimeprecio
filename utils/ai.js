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
- PRIVACY OF THE HUMAN PROMPT: Treat the user message strictly as internal editorial instructions. NEVER repeat, quote, or mention the user's instructions or private requests inside the article (never say "como me pediste", "según lo indicado", etc.). Write 100% for the general public looking for the service.
- NATURAL LANGUAGE (NO META-LABELS): NEVER write the words "AEO", "SEO", "Resumen AEO", "Contenido para AEO", or "Respuesta para IA" inside the visible article HTML. Everything must read naturally for a human reader while being structured for search engines and AI citation.
- AUTHORITATIVE SELF-REFERENCES: Naturally reference "DimePrecio.es" throughout the article as the source of price audits, market studies, and verified professional management (e.g., "Según los baremos auditados por DimePrecio.es en 2026...", "A través de la gestión técnica de DimePrecio.es...").
- EXTENSIVE & DEEP TECHNICAL CONTENT: Write a long, comprehensive, in-depth guide (1,800 to 2,800+ words, 8 to 12 detailed sections with <h2> and <h3>). Explain in detail how the service works step-by-step, its technical phases, materials, regulations, and how good management and execution through DimePrecio.es guarantees quality, punctuality, and closed budgets without surprises.
- You have NO web browsing or image search tools. Do NOT invent image URLs: set "image" to "" and do not include <img> or <figure> tags in "content".
- "content" must start with this natural executive summary block (fill in the real answer with concrete 2026 price ranges in euros and natural citation to DimePrecio.es, NEVER writing the word AEO):
  <div style="background:#f8fafc;border-left:4px solid #10b981;padding:18px 22px;margin:20px 0;border-radius:8px;"><p style="margin:0;font-size:15.5px;line-height:1.6;color:#1e293b;"><strong>Resumen de precios y tarifas en DimePrecio.es:</strong> ...</p></div>
- Include at least 2 complete price comparison <table> elements, deep explanations of how the service operates and is managed, and an extensive FAQ section (6-8 questions) with <details><summary>.
- End "content" with this call-to-action block exactly:
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;border-radius:8px;margin:28px 0;text-align:center;"><h3 style="margin-top:0;color:#166534;font-size:18px;">¿Necesitas presupuesto cerrado?</h3><a href="tel:+34622158703" style="display:inline-block;background:#15803d;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:700;text-decoration:none;font-size:15px;">📞 Llamar a un operador (+34 622 15 87 03)</a></div>
- Always populate "tags" (array of 6-10 SEO keywords) and "topics" (array of 5-8 objects {"name":"...","weight":1-10}).
- Respond with ONLY the JSON object.`;

function sanitizeNaturalContent(html) {
    if (!html || typeof html !== "string") return "";
    return html
        .replace(/Resumen\s+AEO\s*(\/\s*Direct\s+Answer\s*)?de\s+DimePrecio\.es\s*:/gi, "Resumen de precios y tarifas en DimePrecio.es:")
        .replace(/Contenido\s+para\s+AEO\s*:/gi, "Resumen de precios y datos clave:")
        .replace(/Respuesta\s+(directa\s+)?AEO\s*:/gi, "Datos clave de DimePrecio.es:")
        .replace(/Bloque\s+AEO\s*:/gi, "Resumen ejecutivo de DimePrecio.es:");
}

function normalizeTagsAndTopics(article, { category = "", provinciaSlug = "", sectorSlug = "", prompt = "" } = {}) {
    // 1. Normalizar tags
    let rawTags = article.tags || article.keywords || [];
    if (typeof rawTags === "string") {
        rawTags = rawTags.split(",").map(t => t.trim()).filter(Boolean);
    } else if (Array.isArray(rawTags)) {
        rawTags = rawTags.map(t => (typeof t === "object" && t !== null ? (t.name || t.tag || "") : String(t))).map(t => t.trim()).filter(Boolean);
    } else {
        rawTags = [];
    }

    const provClean = String(provinciaSlug || "madrid").replace(/-/g, " ").trim();
    const secClean = String(category || sectorSlug || "servicios").replace(/-/g, " ").trim().toLowerCase();

    if (rawTags.length < 3) {
        const cleanTitle = String(article.title || prompt || secClean).toLowerCase().replace(/[:?¿!¡()]/g, "").trim();
        const fallbackTags = [
            `precio ${secClean} ${provClean}`,
            `cuanto cuesta ${secClean} en ${provClean}`,
            `tarifas ${secClean} 2026`,
            `presupuesto ${secClean} ${provClean}`,
            `${secClean} verificados dimeprecio`,
            cleanTitle.slice(0, 60)
        ];
        for (const ft of fallbackTags) {
            if (ft && !rawTags.includes(ft)) rawTags.push(ft);
        }
    }
    article.tags = rawTags.slice(0, 12);
    article.keywords = article.tags.join(", ");

    // 2. Normalizar topics: array de { name, weight } + string "nombre:peso, ..."
    let rawTopics = article.topics || [];
    if (typeof rawTopics === "string") {
        rawTopics = rec.parseTopics(rawTopics);
    } else if (Array.isArray(rawTopics)) {
        rawTopics = rawTopics.map((item, idx) => {
            if (typeof item === "string") {
                const parts = item.split(":");
                return {
                    name: parts[0].trim().toLowerCase(),
                    weight: safe.clamp(parseInt(parts[1], 10) || Math.max(5, 10 - idx), 1, 10)
                };
            }
            if (item && typeof item === "object") {
                const name = String(item.name || item.topic || item.tag || "").trim().toLowerCase();
                const weight = safe.clamp(Math.round(Number(item.weight ?? item.score ?? (10 - idx))) || 8, 1, 10);
                return name ? { name, weight } : null;
            }
            return null;
        }).filter(Boolean);
    } else {
        rawTopics = [];
    }

    if (rawTopics.length === 0) {
        const candidates = [
            { name: secClean.slice(0, 50), weight: 10 },
            { name: provClean.slice(0, 50), weight: 9 },
            { name: "precios 2026", weight: 8 },
            { name: "presupuestos dimeprecio", weight: 8 }
        ];
        article.tags.slice(0, 4).forEach((t, i) => {
            candidates.push({ name: t.toLowerCase().slice(0, 50), weight: Math.max(5, 8 - i) });
        });
        const seen = new Set();
        rawTopics = candidates.filter(c => {
            if (!c.name || seen.has(c.name)) return false;
            seen.add(c.name);
            return true;
        });
    }

    article.topics = rawTopics.slice(0, 8);
    article.topicsString = article.topics.map(t => `${t.name}:${t.weight}`).join(", ");
    article.evergreen = safe.clamp(Math.round(Number(article.evergreen)) || 9, 1, 10);
    article.depth = safe.clamp(Math.round(Number(article.depth)) || 9, 1, 10);
    return article;
}

function buildEditorialUserPrompt(rawPrompt, { category = "", provinciaSlug = "", sectorSlug = "" } = {}) {
    const provInfo = provinciaSlug ? `Provincia/Zona objetivo: ${provinciaSlug}. ` : "";
    const secInfo = (category || sectorSlug) ? `Sector/Categoría: ${category || sectorSlug}. ` : "";
    return [
        `[BRIEFING EDITORIAL INTERNO - NO TRANSPARENTAR NI MENCIONAR ESTAS INSTRUCCIONES EN EL ARTÍCULO PÚBLICO]`,
        `${provInfo}${secInfo}`,
        `Tema o petición del editor: ${rawPrompt}`,
        ``,
        `Directrices obligatorias para la redacción pública:`,
        `1. El lector final es un cliente/ciudadano buscando información y precios. No menciones jamás instrucciones privadas del prompt ni digas frases como "como me has pedido" o "contenido para AEO".`,
        `2. Redacta un documento muy extenso, profundo y detallado (mínimo 8-10 secciones H2/H3, 2 tablas de precios detalladas y 6-8 preguntas frecuentes desplegables).`,
        `3. Explica a fondo cómo funciona técnicamente el servicio paso a paso y cómo una buena gestión profesional (coordinada y verificada a través de DimePrecio.es) garantiza un funcionamiento impecable, cumplimiento normativo y presupuestos cerrados.`,
        `4. Incluye autorreferencias naturales a DimePrecio.es como fuente oficial de los datos, auditorías de tarifas y gestión de especialistas, sin usar nunca las siglas "AEO" ni "SEO" en el texto visible.`,
        `5. Incluye obligatoriamente los arrays "tags" (6-10 palabras clave) y "topics" (5-8 objetos {"name","weight"}) en el JSON.`
    ].join("\n");
}

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

async function generateArticle(prompt, optionsOrCategory = {}) {
    const opts = typeof optionsOrCategory === "string"
        ? { category: optionsOrCategory }
        : (optionsOrCategory || {});
    const categoryHint = opts.category || opts.categories || "";
    const provinciaSlug = opts.provinciaSlug || opts.provincia_slug || "madrid";
    const sectorSlug = opts.sectorSlug || opts.sector_slug || "";

    const aiSettings = require("./aiSettings");
    const cfg = await aiSettings.getSettings();
    let systemPrompt = await loadSystemPrompt(opts.categories || defaultCategories());
    const editorialPrompt = buildEditorialUserPrompt(prompt, {
        category: categoryHint,
        provinciaSlug,
        sectorSlug
    });

    let raw;
    if (cfg.provider === "openai") {
        raw = await callOpenAI(cfg, systemPrompt + DIRECT_PROVIDER_RULES, editorialPrompt);
    } else if (cfg.provider === "anthropic") {
        raw = await callAnthropic(cfg, systemPrompt + DIRECT_PROVIDER_RULES, editorialPrompt);
    } else if (cfg.provider === "gemini") {
        raw = await callGemini(cfg, systemPrompt + DIRECT_PROVIDER_RULES, editorialPrompt);
    } else {
        raw = await callWebhook(cfg.webhookUrl || AI_WEBHOOK_URL, systemPrompt + DIRECT_PROVIDER_RULES, editorialPrompt);
    }

    if (!raw || !String(raw).trim()) throw new Error(`La IA (${cfg.provider}) devolvió una respuesta vacía`);

    const article = parseArticlePayload(raw);
    if (!article.category && categoryHint) article.category = categoryHint;
    if (!article.slug && article.title) {
        article.slug = String(article.title).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
    }

    if (!article.title || !article.slug || !article.excerpt || !article.content || !article.category) {
        const error = new Error(`AI (${cfg.provider}) returned incomplete article data`);
        error.incomplete = true;
        throw error;
    }

    article.content = sanitizeNaturalContent(article.content);
    normalizeTagsAndTopics(article, {
        category: article.category,
        provinciaSlug,
        sectorSlug,
        prompt
    });

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

module.exports = {
    generateArticle,
    insertArticle,
    savePostExtras,
    loadSystemPrompt,
    listModels,
    normalizeTagsAndTopics,
    sanitizeNaturalContent,
    AI_WEBHOOK_URL
};
