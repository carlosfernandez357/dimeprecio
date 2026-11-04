// Búsqueda de noticias (Google News vía SerpApi) y normalización de resultados.
// La usan el panel admin (buscar y generar artículo) y el scheduler automático.

const SERPAPI_KEY = "d42dd2e5efabf6a42880a6cb035be641061abd8bc9eeb55d88678c4e207d922e";

function firstText(values) {
    for (const value of values) {
        if (typeof value === "string" && value.trim()) return value.trim();
    }
    return "";
}

// Igual que la normalización del cliente en create-article.ejs
function normalize(item) {
    const highlight = item && typeof item.highlight === "object" ? item.highlight : {};
    const story = Array.isArray(item?.stories) && item.stories.length ? item.stories[0] : {};
    const source = item?.source?.name || highlight?.source?.name || story?.source?.name || "";
    const title = firstText([item?.title, highlight?.title, story?.title]) || "Sin título";
    const link = firstText([item?.link, highlight?.link, story?.link, item?.serpapi_link]);
    const image = firstText([
        item?.thumbnail,
        item?.thumbnail_small,
        highlight?.thumbnail,
        highlight?.thumbnail_small,
        story?.thumbnail,
        story?.thumbnail_small
    ]);
    return {
        raw: item,
        title,
        link,
        source,
        image,
        date: firstText([item?.date, highlight?.date, story?.date]),
        isoDate: firstText([item?.iso_date, highlight?.iso_date, story?.iso_date])
    };
}

// Devuelve la respuesta cruda de SerpApi (con news_results ya normalizados añadidos)
async function searchNews(country = "es", { query = "", num = 10 } = {}) {
    const url = "https://serpapi.com/search" +
        "?engine=google_news" +
        "&api_key=" + SERPAPI_KEY +
        "&hl=es" +
        "&gl=" + encodeURIComponent(country) +
        "&num=" + encodeURIComponent(num) +
        (query ? "&q=" + encodeURIComponent(String(query).slice(0, 120)) : "");

    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });

    const raw = await response.text();
    let data = {};
    if (raw && raw.trim()) {
        try {
            data = JSON.parse(raw);
        } catch {
            data = { raw };
        }
    }

    if (!response.ok) {
        const error = new Error(data.error || `SerpApi error ${response.status}`);
        error.status = response.status;
        throw error;
    }

    // Normalizados para consumo directo (scheduler / otros)
    data.normalized = (Array.isArray(data.news_results) ? data.news_results : []).map(normalize);

    return data;
}

module.exports = { searchNews, normalize, SERPAPI_KEY };
