// Diagnóstico puntual: llama al webhook de IA igual que utils/ai.js y muestra crudo
const fs = require("fs");
const path = require("path");

const AI_WEBHOOK_URL = "https://n8n.legion.software/webhook/socialsForceLlm";

async function main() {
    const systemPrompt = fs.readFileSync(path.join(__dirname, "prompts", "article-system.txt"), "utf8");
    const prompt = process.argv[2] || "Escribe un artículo corto sobre la lluvia en Valencia. Responde con el JSON.";

    console.log("Llamando al webhook...", new Date().toISOString());
    const started = Date.now();
    try {
        const res = await fetch(AI_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ systemPrompt, prompt }),
            signal: AbortSignal.timeout(300000) // 5 min para diagnóstico
        });
        console.log("HTTP", res.status, "en", Math.round((Date.now() - started) / 1000) + "s");
        console.log("Headers:", JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2));
        const raw = await res.text();
        console.log("Longitud:", raw.length);
        console.log("Primeros 1500 chars:");
        console.log(raw.slice(0, 1500));

        let payload = {};
        try { payload = JSON.parse(raw); } catch { payload = { output: raw }; }
        let article = payload.output || payload;
        if (typeof article === "string") {
            try { article = JSON.parse(article.replace(/^```(?:json)?\s*|\s*```$/g, "").trim()); }
            catch { article = {}; }
        }
        console.log("\n--- Parseo tipo utils/ai.js ---");
        console.log("keys:", article && typeof article === "object" ? Object.keys(article).join(", ") : typeof article);
        console.log("faltantes:",
            ["title", "slug", "excerpt", "content", "category"]
                .filter(k => !article || !article[k])
                .join(", ") || "ninguno (completo)");
    } catch (error) {
        console.log("ERROR tras", Math.round((Date.now() - started) / 1000) + "s:", error.message);
    }
}

main();
