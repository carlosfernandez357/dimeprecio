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

async function generateArticle(prompt, { categories } = {}) {
    const systemPrompt = await loadSystemPrompt(categories);

    const aiResponse = await fetch(AI_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt, prompt }),
        signal: AbortSignal.timeout(AI_TIMEOUT_MS)
    });

    if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        throw new Error(`AI API error ${aiResponse.status}: ${errorText}`.slice(0, 500));
    }

    const rawBody = await aiResponse.text();
    if (!rawBody || !rawBody.trim()) {
        const error = new Error(
            `AI empty response (HTTP ${aiResponse.status}): el webhook de IA devolvió 0 bytes. ` +
            `Revisa que el workflow de n8n termine y ejecute el nodo "Respond to Webhook".`
        );
        error.emptyResponse = true;
        throw error;
    }

    let payload = {};
    try {
        payload = JSON.parse(rawBody);
    } catch {
        payload = { output: rawBody };
    }

    let article = payload.output || payload;
    if (typeof article === "string") {
        const cleaned = article.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
        try {
            article = JSON.parse(cleaned);
        } catch {
            article = {};
        }
    }
    article = article && typeof article === "object" ? article : {};

    if (!article.title || !article.slug || !article.excerpt || !article.content || !article.category) {
        const error = new Error("AI returned incomplete article data");
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

module.exports = { generateArticle, insertArticle, savePostExtras, loadSystemPrompt, AI_WEBHOOK_URL };
