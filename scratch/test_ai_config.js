// Prueba local de la configuración IA (no publica nada)
const path = require('path');
const ejs = require('ejs');
const aiSettings = require('../utils/aiSettings');
const ai = require('../utils/ai');

(async () => {
  const pub = await aiSettings.getPublicSettings();
  console.log('Proveedor actual:', pub.provider, '| keys:', pub.hasOpenaiKey, pub.hasAnthropicKey, pub.hasGeminiKey);

  // Renderizar la vista para detectar errores de plantilla
  const html = await ejs.renderFile(path.join(__dirname, '../views/admin/config.ejs'), {
    settings: pub, saved: true, title: 'test', allLocations: [], allSectors: []
  }, { async: false }).catch(e => { throw new Error('EJS: ' + e.message); });
  console.log('Vista config.ejs renderizada OK:', html.length, 'bytes');

  // Error controlado si falta la key
  for (const provider of ['openai', 'anthropic', 'gemini']) {
    const cfg = { ...(await aiSettings.getSettings()), provider, openaiKey: '', anthropicKey: '', geminiKey: '' };
    try {
      await ai.listModels(provider, cfg);
      console.log(provider, '-> listModels sin key no lanzó error (inesperado)');
    } catch (e) {
      console.log(provider, '-> error esperado sin key:', e.message.slice(0, 90));
    }
  }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
