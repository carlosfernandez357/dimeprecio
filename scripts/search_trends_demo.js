const https = require('https');

// Función que consulta el endpoint de autocompletado en tiempo real de Google España
function queryGoogleSuggest(term) {
  return new Promise((resolve) => {
    const url = `https://suggestqueries.google.com/complete/search?client=chrome&hl=es&gl=es&q=${encodeURIComponent(term)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          // json[1] es el array con las sugerencias reales de búsqueda
          resolve(json[1] || []);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

async function analyzeKeyword(service, location = 'madrid') {
  console.log(`\n=============================================================`);
  console.log(`🔍 BÚSQUEDAS REALES DE GOOGLE EN ESPAÑA: "${service.toUpperCase()}" en ${location.toUpperCase()}`);
  console.log(`=============================================================\n`);

  // Patrones con alta intención de búsqueda y contratación
  const patterns = [
    `cuanto cuesta ${service} ${location}`,
    `precio ${service} ${location}`,
    `${service} ${location} precios`,
    `tarifas ${service} ${location}`,
    `mejor ${service} ${location}`,
    `${service} urgente ${location}`
  ];

  const allSuggestions = new Set();
  const resultsByPattern = {};

  for (const pattern of patterns) {
    const list = await queryGoogleSuggest(pattern);
    resultsByPattern[pattern] = list;
    list.forEach(item => allSuggestions.add(item));
  }

  // Mostramos los resultados agrupados
  for (const [pat, suggestions] of Object.entries(resultsByPattern)) {
    console.log(`📌 Semilla: "${pat}"`);
    if (suggestions.length === 0) {
      console.log(`   (Sin sugerencias adicionales directas)`);
    } else {
      suggestions.slice(0, 5).forEach((sug, i) => {
        console.log(`   ${i + 1}. ${sug}`);
      });
    }
    console.log('');
  }

  console.log(`-------------------------------------------------------------`);
  console.log(`💡 OPORTUNIDADES TOTALES IDENTIFICADAS: ${allSuggestions.size} términos únicos`);
  console.log(`-------------------------------------------------------------`);
  
  // Filtrar las que contienen preguntas de precio o intención de contratación
  const priceKeywords = [...allSuggestions].filter(s => 
    s.includes('precio') || s.includes('cuesta') || s.includes('cuanto') || s.includes('tarifa') || s.includes('barato') || s.includes('m2')
  );

  console.log(`\n🎯 TOP CONSULTAS DE PRECIOS Y CONTRATACIÓN DETECTADAS:`);
  priceKeywords.slice(0, 10).forEach((kw, idx) => {
    console.log(`   [H2 Sugerido #${idx + 1}] -> "${kw}"`);
  });

  console.log(`\n✅ Estas consultas son las que la gente está buscando ahora mismo en Google.`);
}

async function run() {
  const serviceArg = process.argv[2] || 'fontanero';
  const locationArg = process.argv[3] || 'madrid';
  await analyzeKeyword(serviceArg, locationArg);
}

run();
