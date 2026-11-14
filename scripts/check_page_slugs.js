const http = require('http');

http.get('http://127.0.0.1:3000/madrid', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const re = /href="\/article\/([^"?]+)/g;
    const matches = [];
    let m;
    while ((m = re.exec(data)) !== null) {
      matches.push(m[1]);
    }
    const uniqueSlugs = [...new Set(matches)];
    console.log(`Total enlaces a artículos en /madrid: ${matches.length} (Únicos: ${uniqueSlugs.length})`);
    uniqueSlugs.forEach(s => console.log(' - ' + s));
    process.exit(0);
  });
}).on('error', (e) => {
  console.error(e);
  process.exit(1);
});
