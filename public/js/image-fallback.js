// Script global para el cliente: gestiona fallbacks aleatorios cuando una imagen falla al cargar (404/red).
(function() {
  var FALLBACK_COUNT = 25;
  function getRandomLocalFallback() {
    var rand = Math.floor(Math.random() * FALLBACK_COUNT) + 1;
    return '/images/fallbacks/service-' + rand + '.jpg';
  }

  // Interceptar errores de carga de imágenes en cualquier parte de la web
  document.addEventListener('error', function(e) {
    var target = e.target;
    if (target && target.tagName && target.tagName.toLowerCase() === 'img') {
      if (target.dataset.fallbackApplied) return; // Evitar bucle infinito si fallara
      target.dataset.fallbackApplied = 'true';
      target.src = getRandomLocalFallback();
    }
  }, true);

  // Al cargar el DOM, si alguna imagen no tiene src válido, asignarle fallback aleatorio
  document.addEventListener('DOMContentLoaded', function() {
    var imgs = document.querySelectorAll('img');
    imgs.forEach(function(img) {
      if (!img.getAttribute('src') || img.getAttribute('src') === '/images/noimage.jpg') {
        img.src = getRandomLocalFallback();
      }
    });
  });
})();
