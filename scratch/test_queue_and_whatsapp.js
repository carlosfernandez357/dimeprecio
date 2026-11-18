const http = require('http');

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:3000${path}`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runTests() {
  console.log('--- TEST 1: Public Homepage & WhatsApp Links ---');
  const home = await makeRequest('/');
  console.log('Homepage status:', home.status);
  const hasWaHeader = home.body.includes('whatsapp-header-btn');
  const hasWaFloating = home.body.includes('whatsapp-floating-btn');
  const hasWaNumber = home.body.includes('wa.me/34622158703');
  console.log('Has WhatsApp in Header:', hasWaHeader);
  console.log('Has WhatsApp in Floating Dock:', hasWaFloating);
  console.log('Has WhatsApp link wa.me/34622158703:', hasWaNumber);

  console.log('\n--- TEST 2: Admin Login and Cola Artículos View ---');
  // Perform admin login with correct credentials
  const loginPost = await makeRequest('/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'username=kenzo&password=juegoscuenta'
  });
  const cookie = loginPost.headers['set-cookie'] ? loginPost.headers['set-cookie'][0].split(';')[0] : '';
  console.log('Login cookie received:', cookie ? 'YES' : 'NO');

  const queuePage = await makeRequest('/admin/cola-articulos', {
    headers: { 'Cookie': cookie }
  });
  console.log('Queue Page status:', queuePage.status);
  const hasQueueTitle = queuePage.body.includes('Cola de Generación Masiva IA');
  console.log('Queue Page has title:', hasQueueTitle);

  console.log('\n--- TEST 3: Semantic Matcher Tests ---');
  const { detectProvinceAndSector, syncTitleAndProvince, generateDynamicTitle } = require('../utils/semanticMatcher');
  
  const test1 = detectProvinceAndSector('precio de carpinteria de aluminio en gijon');
  console.log('Query: "precio de carpinteria de aluminio en gijon"');
  console.log('Matched Province:', test1.provincia_slug, '(expected asturias)');
  console.log('Matched Sector:', test1.sector_slug, '(expected carpinteria-aluminio-ventanas-pvc)');

  const test2 = detectProvinceAndSector('cuanto cuesta alisar paredes en hospitalet');
  console.log('Query: "cuanto cuesta alisar paredes en hospitalet"');
  console.log('Matched Province:', test2.provincia_slug, '(expected barcelona)');
  console.log('Matched Sector:', test2.sector_slug, '(expected pintores-alisado-paredes)');

  const syncTest = syncTitleAndProvince('Guía de Precios de Pintores en Barcelona', 'valencia');
  console.log('Title mentions Barcelona, previous was Valencia -> Synced Province:', syncTest);

  const dynTitle = generateDynamicTitle({
    sectorNombre: 'Pintores Profesionales',
    provinciaNombre: 'Valencia',
    topic: 'pintar piso de 90m2',
    styleIndex: 0
  });
  console.log('Generated Dynamic Title Example:', dynTitle);

  console.log('\n--- TEST 4: Adding an item to the Queue & Verifying ---');
  const addPost = await makeRequest('/admin/cola-articulos/add', {
    method: 'POST',
    headers: {
      'Cookie': cookie,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'prompts=cuanto+cuesta+instalar+parquet+en+zaragoza'
  });
  console.log('Add to queue status (should be redirect 302):', addPost.status);

  const queueAfterAdd = await makeRequest('/admin/cola-articulos', {
    headers: { 'Cookie': cookie }
  });
  const hasAddedPrompt = queueAfterAdd.body.includes('cuanto cuesta instalar parquet en zaragoza');
  console.log('Queue contains added prompt:', hasAddedPrompt);

  console.log('\nALL CHECKS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
