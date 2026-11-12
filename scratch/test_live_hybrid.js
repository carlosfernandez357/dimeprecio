async function testSearch() {
  const tests = [
    {
      name: 'API: Typo tolerance "serrajero"',
      url: 'http://localhost:3000/api/search/suggest?q=serrajero'
    },
    {
      name: 'API: Intent "fuga de agua" in barcelona',
      url: 'http://localhost:3000/api/search/suggest?q=fuga+de+agua&provincia=barcelona'
    },
    {
      name: 'API: Gibberish fallback',
      url: 'http://localhost:3000/api/search/suggest?q=palabra_rara_xyz_123'
    },
    {
      name: 'Web: /search with cerrajero',
      url: 'http://localhost:3000/search?q=cerrajero&provincia=madrid'
    },
    {
      name: 'Web: /search with fallback',
      url: 'http://localhost:3000/search?q=palabra_totalmente_inexistente_999&provincia=madrid'
    }
  ];

  for (const t of tests) {
    const res = await fetch(t.url);
    if (t.url.includes('/api/')) {
      const data = await res.json();
      console.log('=== ' + t.name + ' ===');
      console.log('Status:', res.status, 'isFallback:', data.isFallback);
      console.log('Top sector:', data.sectors?.[0]?.nombre, '(' + data.sectors?.[0]?.slug + ')');
      console.log('Pages count:', data.pages?.length, 'Top page:', data.pages?.[0]?.title);
    } else {
      const html = await res.text();
      console.log('=== ' + t.name + ' ===');
      console.log('Status:', res.status, 'Length:', html.length);
      console.log('Has fallback banner:', html.includes('Sin coincidencias exactas para'));
      console.log('Has filter bar:', html.includes('name="provincia"') && html.includes('name="sector"'));
    }
  }
}

testSearch();
