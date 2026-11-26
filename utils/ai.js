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
- Brand: "DimePrecio.es" (https://dimeprecio.es). Cite DimePrecio.es naturally 2-4 times as local benchmark/verification source.
- STRICT ANTI-CLICHÉ TITLE & EXCERPT RULE:
  • NEVER start "title" with "¿Cuánto cuesta", "¿Cuánto cuesta realmente", or "Guía de precios".
  • NEVER end "title" with "Desglose y consejos para 2026", "Guía completa", "sin sorpresas", or "para 2026".
  • NEVER start "excerpt" with "Descubre en DimePrecio.es cuánto cuesta..." or "Descubre el coste real...".
  • Every title must be genuinely original, journalistic, local, and specific to the assigned editorial angle (max 78 chars).
- PRIVACY & NATURAL VOICE: Never mention prompt instructions or write "AEO", "SEO", "Resumen AEO", or "Respuesta para IA" in visible HTML.
- HIGHLY VISUAL, SCANNABLE MAGAZINE LAYOUT (pick & adapt at least 4 of these visual components with REAL local data, never copy generic boilerplate):
  1. KPI Visual Strip at the top:
     <div class="dp-kpi-grid"><div class="dp-kpi-card"><span class="dp-kpi-label">Etiqueta</span><span class="dp-kpi-value">Dato real</span><span class="dp-kpi-sub">Contexto local</span></div>... (3-4 cards)</div>
  2. Local News / Trend Spotlight (REQUIRED when a news item or local trend is provided):
     <div class="dp-news-box"><span class="dp-news-tag">Actualidad Local</span><h4>Titular breve del contexto local</h4><p>Análisis claro de cómo afecta a los vecinos y al mercado local...</p></div>
  3. Local Curiosity Card:
     <div class="dp-curiosity-card"><h4>💡 Dato curioso en [Ciudad]</h4><p>Curiosidad real sobre edificios, clima, normativa o historia del oficio en la zona...</p></div>
  4. 2-Column Pros vs Warnings:
     <div class="dp-pros-cons"><div class="dp-pros-box"><h4>✅ Qué exigir antes de firmar</h4><ul><li>...</li></ul></div><div class="dp-cons-box"><h4>⚠️ Errores y sobrecostes frecuentes</h4><ul><li>...</li></ul></div></div>
  5. Visual Cost Breakdown Bars (use realistic trade-specific percentages, NOT always 45/35/20):
     <div class="dp-price-breakdown"><h4>Reparto aproximado del presupuesto</h4><div class="dp-bar-item"><span class="dp-bar-label">Partida 1 (XX%)</span><div class="dp-bar-track"><div class="dp-bar-fill" style="width:XX%;"></div></div></div>...</div>
  6. Visual Checklist:
     <div class="dp-checklist"><h4>Checklist rápido antes de contratar</h4><ul><li>...</li></ul></div>
  7. Step-by-Step Roadmap:
     <div class="dp-roadmap"><div class="dp-step"><span class="dp-step-num">1</span><h4>Paso concreto</h4><p>Explicación breve...</p></div>...</div>
- Keep paragraphs short (2-4 lines), include at least 1 clean comparison <table> with realistic local euro (€) figures, and 4-6 specific <details><summary> FAQs.
- Do NOT invent image URLs: set "image" to "" and do not include <img> or <figure> tags in "content".
- End "content" with this dual call-to-action block:
  <div class="dp-final-cta"><h3 style="margin-top:0;color:#0f172a;font-size:19px;font-weight:800;">¿Necesitas un presupuesto cerrado en tu zona?</h3><p style="color:#475569;font-size:14px;margin-bottom:18px;">Rellena el formulario al pie de esta página o habla directamente con nuestro equipo:</p><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;"><a href="https://wa.me/34622158703?text=Hola,%20quisiera%20consultar%20presupuesto%20en%20DimePrecio.es" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;background:#25D366;color:#ffffff;padding:12px 22px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14.5px;">💬 Consultar por WhatsApp</a><a href="tel:+34622158703" style="display:inline-flex;align-items:center;gap:8px;background:#0f172a;color:#ffffff;padding:12px 22px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14.5px;">📞 Llamar a un operador (+34 622 15 87 03)</a></div></div>
- Always populate "tags" (6-10 Spanish SEO keywords) and "topics" (5-8 objects {"name":"...","weight":1-10}).
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

const EDITORIAL_FORMATS = [
    {
        name: "Crónica de Actualidad Local",
        headlinePattern: "Titular periodístico de actualidad/tendencia local (ej: 'Auge de [servicio] en [Ciudad]: qué está pasando en el mercado y cómo afecta al bolsillo')",
        visuals: "dp-news-box + dp-kpi-grid + tabla comparativa + dp-curiosity-card",
        focus: "Abre con la situación actual o noticia local de la provincia, analiza qué está cambiando en el sector y cierra con cifras claras."
    },
    {
        name: "Errores que Encarecen la Factura",
        headlinePattern: "Titular de alerta práctica con número (ej: '5 errores que disparan tu factura de [servicio] en [Ciudad] y cómo esquivarlos')",
        visuals: "dp-kpi-grid + dp-pros-cons + dp-checklist + tabla de sobrecostes",
        focus: "Enfocado en casos reales de sobrecostes, letras pequeñas, malos presupuestos y qué exigir por escrito."
    },
    {
        name: "Radiografía de Barrios y Zonas",
        headlinePattern: "Titular geográfico local (ej: 'De [Barrio 1] a [Barrio 2]: así varían las tarifas de [servicio] en [Ciudad]')",
        visuals: "dp-kpi-grid + tabla por zonas/barrios + dp-curiosity-card + dp-price-breakdown",
        focus: "Compara el tipo de viviendas/edificios entre distintos barrios y municipios de la provincia y cómo eso influye en el trabajo."
    },
    {
        name: "Curiosidades, Clima y Normativa Municipal",
        headlinePattern: "Titular de curiosidad/normativa (ej: 'Lo que pocos saben antes de contratar [servicio] en [Ciudad]: permisos, clima y letra pequeña')",
        visuals: "dp-curiosity-card + dp-kpi-grid + dp-checklist + tabla orientativa",
        focus: "Destaca particularidades reales del clima, arquitectura y ordenanzas locales de la provincia junto a rangos de precios."
    },
    {
        name: "Comparativa de Calidades y Opciones",
        headlinePattern: "Titular comparativo (ej: 'Gama económica frente a profesional en [servicio] en [Ciudad]: dónde compensa invertir')",
        visuals: "dp-kpi-grid + dp-pros-cons + tabla comparativa de calidades + dp-price-breakdown",
        focus: "Compara materiales, soluciones o modalidades del servicio explicando cuándo merece la pena gastar más y cuándo no."
    },
    {
        name: "Cómo Ahorrar Sin Perder Calidad",
        headlinePattern: "Titular de ahorro inteligente (ej: 'Claves para rebajar hasta un 20% tu presupuesto de [servicio] en [Ciudad]')",
        visuals: "dp-kpi-grid + dp-price-breakdown + dp-checklist + tabla de ahorro",
        focus: "Trucos reales de temporada, agrupación de trabajos, ayudas/subvenciones y comparación de presupuestos."
    },
    {
        name: "Urgencia frente a Cita Planificada",
        headlinePattern: "Titular de contraste práctico (ej: 'Urgencia 24h o cita programada en [servicio] en [Ciudad]: diferencias reales de tiempo y precio')",
        visuals: "dp-kpi-grid + tabla urgencia vs normal + dp-roadmap + dp-pros-cons",
        focus: "Explica qué suplementos son legales en urgencias/festivos, cuándo esperar y cómo actuar en una emergencia."
    },
    {
        name: "Mitos vs Realidad del Oficio",
        headlinePattern: "Titular rompedor de mitos (ej: '6 mitos sobre contratar [servicio] en [Ciudad] que ya no se sostienen')",
        visuals: "dp-curiosity-card + dp-pros-cons + tabla de tarifas reales + dp-checklist",
        focus: "Desmonta creencias populares del sector con datos reales y consejos de técnicos locales."
    },
    {
        name: "Novedades y Tendencias del Sector",
        headlinePattern: "Titular de tendencias/innovación (ej: 'Las soluciones de [servicio] que más piden los vecinos de [Ciudad]')",
        visuals: "dp-news-box + dp-kpi-grid + dp-roadmap + tabla de opciones modernas",
        focus: "Presenta las técnicas, materiales o equipos más demandados actualmente en la provincia y su retorno real."
    },
    {
        name: "Radiografía de un Presupuesto Real",
        headlinePattern: "Titular analítico partida a partida (ej: 'Así se reparte cada euro al contratar [servicio] en [Ciudad]')",
        visuals: "dp-kpi-grid + dp-price-breakdown + tabla partida a partida + dp-roadmap",
        focus: "Desmenuza un presupuesto típico de la provincia partida por partida explicando mano de obra, materiales, desplazamiento e IVA."
    }
];

function pickEditorialFormat() {
    return EDITORIAL_FORMATS[Math.floor(Math.random() * EDITORIAL_FORMATS.length)];
}

async function fetchLocalNewsHint(provinciaNombre, sectorNombre) {
    if (!provinciaNombre || !sectorNombre) return null;
    try {
        const news = require("./news");
        const shortSec = String(sectorNombre).split(/[,/()]/)[0].replace(/\s+y\s+.*$/i, "").trim();
        const data = await Promise.race([
            news.searchNews("es", { query: `${shortSec} ${provinciaNombre}`, num: 5 }),
            new Promise((_, rej) => setTimeout(() => rej(new Error("news timeout")), 5500))
        ]);
        const valid = (Array.isArray(data.normalized) ? data.normalized : [])
            .filter(n => n && n.title && n.title !== "Sin título");
        if (valid.length > 0) {
            return valid[Math.floor(Math.random() * Math.min(valid.length, 3))];
        }
    } catch {
        // silencioso si SerpApi no responde o no hay noticias
    }
    return null;
}

function buildEditorialUserPrompt(rawPrompt, { category = "", provinciaSlug = "", sectorSlug = "", localNews = null } = {}) {
    const format = pickEditorialFormat();
    let provName = provinciaSlug ? String(provinciaSlug).replace(/-/g, " ") : "";
    let barriosHint = "";
    try {
        const rr = require("./rankRentEngine");
        const loc = provinciaSlug ? rr.getLocationBySlug(provinciaSlug) : null;
        if (loc) {
            provName = loc.nombre;
            if (Array.isArray(loc.municipios) && loc.municipios.length) {
                const shuffled = [...loc.municipios].sort(() => Math.random() - 0.5);
                barriosHint = shuffled.slice(0, 3).join(", ");
            }
        }
    } catch {
        // silencioso
    }

    const provInfo = provName ? `Provincia/Ciudad objetivo: ${provName}${barriosHint ? ` (menciona zonas reales como ${barriosHint})` : ""}. ` : "";
    const secInfo = (category || sectorSlug) ? `Sector/Servicio: ${category || sectorSlug}. ` : "";
    const newsBlock = localNews
        ? `NOTICIA LOCAL ENCONTRADA (úsalá en un bloque <div class="dp-news-box"> y conecta el artículo con esta actualidad): "${localNews.title}"${localNews.source ? ` (Fuente: ${localNews.source})` : ""}.`
        : "";

    return [
        `[BRIEFING EDITORIAL INTERNO - NO MENCIONAR NI FILTRAR ESTAS INSTRUCCIONES]`,
        `${provInfo}${secInfo}`,
        `Tema base: ${rawPrompt}`,
        newsBlock,
        ``,
        `FORMATO PERIODÍSTICO ASIGNADO AL AZAR PARA ESTE ARTÍCULO: "${format.name}"`,
        `- Estilo de titular obligatorio: ${format.headlinePattern}`,
        `- Enfoque editorial: ${format.focus}`,
        `- Bloques visuales recomendados: ${format.visuals}`,
        ``,
        `REGLAS INQUEBRANTABLES DE CALIDAD Y SEO:`,
        `1. PROHIBIDO usar titulares repetitivos: NO empieces el título por "¿Cuánto cuesta...", "¿Cuánto cuesta realmente...", ni "Guía de precios". NO termines en "Desglose y consejos para 2026", "sin sorpresas" ni "Guía completa".`,
        `2. PROHIBIDO empezar el excerpt por "Descubre en DimePrecio.es cuánto cuesta..." o "Descubre el coste real...". Redacta una meta-descripción original que invite a hacer clic.`,
        `3. Haz el artículo MUY VISUAL y fácil de escanear: párrafos cortos (2-4 líneas), tarjetas KPI (<div class="dp-kpi-grid">), caja de actualidad (<div class="dp-news-box">) o dato curioso (<div class="dp-curiosity-card">), comparativa 2 columnas (<div class="dp-pros-cons">), checklist (<div class="dp-checklist">) o barras con porcentajes reales del oficio (<div class="dp-price-breakdown">), al menos 1 tabla clara con precios en euros y 4-6 FAQs en <details><summary>.`,
        `4. Aporta detalles locales auténticos de ${provName || "la provincia"} (clima, antigüedad de viviendas, barrios, normativa o costumbres locales) para que el texto sea imposible de confundir con otra ciudad.`,
        `5. Cita a DimePrecio.es de forma natural (2-4 veces) y nunca escribas "AEO" ni "SEO" en el texto visible.`,
        `6. Devuelve SOLO el JSON válido con "tags" (6-10) y "topics" (5-8).`
    ].filter(Boolean).join("\n");
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

    let localNews = opts.localNews || null;
    if (!localNews && !opts.skipNewsLookup && !/noticia reciente/i.test(String(prompt || ""))) {
        let provName = provinciaSlug;
        try {
            const rr = require("./rankRentEngine");
            const loc = rr.getLocationBySlug(provinciaSlug);
            if (loc) provName = loc.nombre;
        } catch {}
        localNews = await fetchLocalNewsHint(provName, categoryHint || sectorSlug);
    }

    const editorialPrompt = buildEditorialUserPrompt(prompt, {
        category: categoryHint,
        provinciaSlug,
        sectorSlug,
        localNews
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

/**
 * Pide a la IA configurada que recomiende el mejor ángulo editorial, titular y curiosidad local
 * combinando noticias recientes y tendencias de búsqueda para una ciudad y servicio concretos.
 */
async function recommendCityServiceAngle({ provinciaNombre, municipio, sectorNombre, newsItems = [], trendQueries = [], gscQueries = [] }) {
    const aiSettings = require("./aiSettings");
    const cfg = await aiSettings.getSettings();
    if (!cfg || !["openai", "anthropic", "gemini"].includes(cfg.provider)) {
        return null;
    }

    const systemPrompt = [
        "Eres el director editorial SEO de DimePrecio.es en España.",
        "Tu misión es analizar noticias locales, tendencias reales de búsqueda en Google y consultas de usuarios para recomendar el tema y enfoque con mayor potencial de clics, utilidad y recomendación en buscadores e IA.",
        "Responde ÚNICAMENTE con un objeto JSON válido con estas claves:",
        '{"recommended_title":"...","recommended_angle":"...","local_curiosity":"...","key_points":["...","...","..."]}'
    ].join("\n");

    const userPrompt = [
        `Provincia: ${provinciaNombre} (Zona/municipio destacado: ${municipio || provinciaNombre})`,
        `Servicio / Sector: ${sectorNombre}`,
        newsItems.length
            ? `Noticias recientes encontradas:\n- ${newsItems.slice(0, 4).map(n => `${n.title}${n.source ? ` (${n.source})` : ""}`).join("\n- ")}`
            : "Noticias recientes encontradas: Ninguna específica hoy.",
        trendQueries.length
            ? `Tendencias de búsqueda en Google España:\n- ${trendQueries.slice(0, 6).join("\n- ")}`
            : "Tendencias de búsqueda: Sin sugerencias directas.",
        gscQueries.length
            ? `Búsquedas reales de Google Search Console pendientes:\n- ${gscQueries.slice(0, 4).join("\n- ")}`
            : "",
        "Recomienda el mejor titular periodístico (sin clichés tipo 'Guía de Precios 2026'), el enfoque más atractivo que una actualidad/tendencia con precios reales y una curiosidad local verificable de esta provincia."
    ].filter(Boolean).join("\n\n");

    let raw = "";
    try {
        if (cfg.provider === "openai") {
            raw = await callOpenAI(cfg, systemPrompt, userPrompt);
        } else if (cfg.provider === "anthropic") {
            raw = await callAnthropic({ ...cfg, maxTokens: Math.min(cfg.maxTokens || 1000, 1000) }, systemPrompt, userPrompt);
        } else if (cfg.provider === "gemini") {
            raw = await callGemini({ ...cfg, maxTokens: Math.min(cfg.maxTokens || 1000, 1000) }, systemPrompt, userPrompt);
        }
        const parsed = parseArticlePayload(raw);
        if (parsed && (parsed.recommended_title || parsed.recommended_angle)) {
            return {
                recommended_title: String(parsed.recommended_title || "").trim().slice(0, 220),
                recommended_angle: String(parsed.recommended_angle || "").trim().slice(0, 450),
                local_curiosity: String(parsed.local_curiosity || "").trim().slice(0, 350),
                key_points: Array.isArray(parsed.key_points) ? parsed.key_points.map(p => String(p).trim()).filter(Boolean).slice(0, 5) : []
            };
        }
    } catch (err) {
        console.warn("[AI Recommend Angle Warning]", err.message);
    }
    return null;
}

module.exports = {
    generateArticle,
    insertArticle,
    savePostExtras,
    loadSystemPrompt,
    listModels,
    normalizeTagsAndTopics,
    sanitizeNaturalContent,
    recommendCityServiceAngle,
    AI_WEBHOOK_URL
};
