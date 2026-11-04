const axios = require("axios");
const cheerio = require("cheerio");
const dns = require("dns").promises;
const net = require("net");

// ---------- Protección SSRF ----------
// Bloquea URLs que apunten a la red interna, localhost o servicios cloud privados.

function isPrivateIPv4(ip) {
    const parts = ip.split(".").map(Number);
    if (parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return true;
    const [a, b] = parts;
    return a === 0                                    // 0.0.0.0/8
        || a === 10                                   // 10.0.0.0/8
        || a === 127                                  // loopback
        || (a === 100 && b >= 64 && b <= 127)         // 100.64.0.0/10 (CGNAT)
        || (a === 169 && b === 254)                   // link-local / metadata cloud
        || (a === 172 && b >= 16 && b <= 31)          // 172.16.0.0/12
        || (a === 192 && b === 168)                   // 192.168.0.0/16
        || a >= 224;                                  // multicast / reservado
}

function isPrivateIp(ip) {
    if (net.isIPv4(ip)) return isPrivateIPv4(ip);
    if (net.isIPv6(ip)) {
        const low = ip.toLowerCase();
        return low === "::1"                            // loopback
            || low === "::"                             // sin destino
            || low.startsWith("fc") || low.startsWith("fd")   // ULA
            || low.startsWith("fe80")                   // link-local
            || low.startsWith("::ffff:");               // mapeada IPv4 (se re-valida abajo)
    }
    return true; // formato desconocido: por seguridad se bloquea
}

async function assertPublicUrl(rawUrl) {
    let url;
    try {
        url = new URL(rawUrl);
    } catch {
        throw new Error("URL no válida");
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Protocolo no permitido (solo http/https)");
    }

    const hostname = url.hostname.replace(/^\[|\]$/g, "");

    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
        throw new Error("Acceso bloqueado");
    }

    // IP literal
    if (net.isIP(hostname)) {
        if (isPrivateIp(hostname)) throw new Error("Acceso bloqueado");
        return url;
    }

    // Resuelve el hostname y valida todas las direcciones
    let addresses;
    try {
        addresses = await dns.lookup(hostname, { all: true });
    } catch {
        throw new Error("No se pudo resolver el dominio");
    }

    if (!addresses.length || addresses.some(a => isPrivateIp(a.address))) {
        throw new Error("Acceso bloqueado");
    }

    return url;
}

async function extractPage(inputUrl) {
    let url = String(inputUrl || "").trim();

    if (!/^https?:\/\//i.test(url)) {
        url = "http://" + url;
    }

    // Valida la URL antes de salir de la máquina
    const checked = await assertPublicUrl(url);
    url = checked.href;

    const response = await axios.get(url, {
        timeout: 15000,
        maxRedirects: 5,
        maxContentLength: 5 * 1024 * 1024,      // 5 MB máximo
        maxBodyLength: 1 * 1024 * 1024,

        // Re-valida cada salto de redirect: axios ejecuta este hook de forma
        // síncrona, así que se comprueba hostname/IP literal sin DNS aquí y
        // la URL final se valida además después de la respuesta.
        beforeRedirect: (options) => {
            const host = String(
                (options.headers && options.headers.host) ||
                new URL(typeof options.url === "string" ? options.url : url).hostname
            ).toLowerCase().replace(/:\d+$/, "");
            if (!host || host === "localhost" || host.endsWith(".local") || host.endsWith(".localhost")) {
                throw new Error("Acceso bloqueado (redirect)");
            }
            if (net.isIP(host) && isPrivateIp(host)) {
                throw new Error("Acceso bloqueado (redirect)");
            }
        },

        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1"
        },

        responseType: "text",
        validateStatus: status => status >= 200 && status < 400
    });

    const finalUrl = response.request?.res?.responseUrl || url;

    // Re-valida la URL final por si un redirect desembocó en la red interna
    try {
        await assertPublicUrl(finalUrl);
    } catch {
        throw new Error("Acceso bloqueado (URL final)");
    }

    const $ = cheerio.load(response.data);

    $("script, style, noscript, svg, canvas, iframe, form, template, video, audio").remove();

    $("a[href]").each((_, element) => {
        const href = $(element).attr("href");

        if (href) {
            try {
                $(element).attr(
                    "href",
                    new URL(href, finalUrl).href
                );
            } catch {}
        }
    });

    $("img[src]").each((_, element) => {
        const src = $(element).attr("src");

        if (src) {
            try {
                $(element).attr(
                    "src",
                    new URL(src, finalUrl).href
                );
            } catch {}
        }
    });

    const title = $("title").first().text().trim();

    const description =
        $('meta[name="description"]').attr("content")?.trim() || "";

    const text = $("body")
        .text()
        .replace(/\s+/g, " ")
        .trim();

    const links = [];

    $("a[href]").each((_, element) => {
        const href = $(element).attr("href");
        const text = $(element).text().replace(/\s+/g, " ").trim();

        if (href && text) {
            links.push({
                text,
                url: href
            });
        }
    });

    const images = [];

    $("img[src]").each((_, element) => {
        images.push({
            url: $(element).attr("src"),
            alt: $(element).attr("alt") || ""
        });
    });

    const html = $("body").html();

    return {
        url,
        finalUrl,
        redirected: url !== finalUrl,
        status: response.status,
        title,
        description,
        text,
        links,
        images,
        html
    };
}

module.exports = extractPage;