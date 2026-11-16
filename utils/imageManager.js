// Utilidad para resolver y aleatorizar imágenes, gestionar fallbacks variados y evitar repeticiones.
const fs = require('fs');
const path = require('path');

const FALLBACK_DIR = path.join(__dirname, '..', 'public', 'images', 'fallbacks');
let cachedFallbacks = [];

function getLocalFallbacks() {
  if (cachedFallbacks.length > 0) return cachedFallbacks;
  try {
    if (fs.existsSync(FALLBACK_DIR)) {
      const files = fs.readdirSync(FALLBACK_DIR).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
      cachedFallbacks = files.map(f => `/images/fallbacks/${f}`);
    }
  } catch (e) {
    console.error('[imageManager] Error leyendo fallbacks locales:', e.message);
  }
  if (!cachedFallbacks.length) {
    cachedFallbacks = ['/images/noimage.jpg'];
  }
  return cachedFallbacks;
}

// Devuelve una imagen aleatoria de la carpeta local de fallbacks
function getRandomFallbackImage(seed = '') {
  const list = getLocalFallbacks();
  if (list.length === 1) return list[0];
  if (seed) {
    let hash = 0;
    const str = String(seed);
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % list.length;
    return list[idx];
  }
  const randIdx = Math.floor(Math.random() * list.length);
  return list[randIdx];
}

// Asegura que en un array de posts/artículos no se repita la misma imagen consecutiva o excesivamente
function diversifyArticleImages(posts = []) {
  if (!Array.isArray(posts) || posts.length === 0) return posts;
  const fallbacks = getLocalFallbacks();
  const seenUrls = new Map();

  return posts.map((p, index) => {
    if (!p) return p;
    let img = p.featured_image || p.image || '';
    
    // Si no tiene imagen o apunta a noimage básico, asignar una del pool variado basada en su id/slug
    if (!img || img === '/images/noimage.jpg' || img === '/images/unkown.png') {
      img = getRandomFallbackImage(p.slug || p.id || index);
    } else {
      // Si la misma imagen ya ha aparecido más de una vez en el listado, aleatorizar con un fallback variado
      const count = seenUrls.get(img) || 0;
      if (count >= 1) {
        // Asignar una imagen rotativa de calidad
        const fallbackPick = fallbacks[(index + (p.id || 0)) % fallbacks.length];
        img = fallbackPick;
      }
      seenUrls.set(img, count + 1);
    }

    return {
      ...p,
      image: img,
      featured_image: img
    };
  });
}

module.exports = {
  getLocalFallbacks,
  getRandomFallbackImage,
  diversifyArticleImages
};
