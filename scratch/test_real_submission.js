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

async function run() {
  console.log('--- 1. Login as Admin ---');
  const loginPost = await makeRequest('/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'username=kenzo&password=juegoscuenta'
  });
  const cookie = loginPost.headers['set-cookie'] ? loginPost.headers['set-cookie'][0].split(';')[0] : '';

  console.log('--- 2. Submit a real test quote ---');
  const rr = require('../utils/rankRentEngine');
  const lead = rr.submitQuoteRequestToAgent({
    nombre_cliente: 'Cliente Real Test',
    telefono_whatsapp: '600123456',
    email_opcional: 'test@real.es',
    provincia_slug: 'madrid',
    sector_slug: 'electricistas-boletines',
    explicacion_cliente: 'Necesito cambio de cuadro eléctrico y boletín oficial',
  });
  console.log('Lead created:', lead.id, lead.codigo, lead.nombre_cliente);

  // Wait 600ms for async DB insert to complete
  await new Promise(r => setTimeout(r, 600));

  console.log('--- 3. Check /admin/presupuestos shows the new lead ---');
  let res = await makeRequest('/admin/presupuestos', {
    headers: { 'Cookie': cookie }
  });
  const hasLead = res.body.includes('Cliente Real Test');
  console.log('Admin shows new lead:', hasLead);

  console.log('--- 4. Delete the lead ---');
  await rr.deleteQuoteRequest(lead.codigo);
  await new Promise(r => setTimeout(r, 300));

  console.log('--- 5. Verify /admin/presupuestos is empty again and NO dummy clients appear ---');
  res = await makeRequest('/admin/presupuestos', {
    headers: { 'Cookie': cookie }
  });
  const hasLeadAfter = res.body.includes('Cliente Real Test');
  const hasCarlos = res.body.includes('Carlos Martínez');
  console.log('Lead is gone:', !hasLeadAfter);
  console.log('Carlos Martinez is NOT present:', !hasCarlos);

  if (hasLead && !hasLeadAfter && !hasCarlos) {
    console.log('SUCCESS: Full lifecycle verified!');
  } else {
    console.error('FAILURE!');
    process.exit(1);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
