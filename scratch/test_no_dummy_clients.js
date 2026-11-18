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
  console.log('Cookie obtained:', cookie ? 'YES' : 'NO');

  console.log('--- 2. Fetch /admin/presupuestos ---');
  const res = await makeRequest('/admin/presupuestos', {
    headers: { 'Cookie': cookie }
  });
  console.log('Status:', res.status);
  const hasCarlos = res.body.includes('Carlos Martínez');
  const hasLaura = res.body.includes('Laura Gómez');
  const hasComunidad = res.body.includes('Comunidad Prop. Avenida Europa');
  console.log('Contains Carlos Martínez:', hasCarlos);
  console.log('Contains Laura Gómez:', hasLaura);
  console.log('Contains Comunidad Prop:', hasComunidad);

  if (!hasCarlos && !hasLaura && !hasComunidad) {
    console.log('SUCCESS: All 3 dummy demo clients are completely gone!');
  } else {
    console.error('FAILURE: Dummy clients still present!');
    process.exit(1);
  }

  console.log('--- 3. Verify Empty State Message ---');
  const hasEmptyNotice = res.body.includes('No hay solicitudes para los filtros seleccionados');
  console.log('Shows empty notice:', hasEmptyNotice);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
