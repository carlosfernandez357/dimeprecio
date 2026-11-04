// ============================================================================
// PidePrecio.es — Detector Automático de Zona (IP + Código Postal + GPS)
// y Autocompletado del Buscador estilo SocialsForce
// ============================================================================
(function () {
  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + (days || 180) * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + d.toUTCString() + '; path=/; SameSite=Lax';
  }

  function applyDetectedProvinceToDOM(prov, shouldReloadIfHome) {
    if (!prov || !prov.slug) return;
    var prevSlug = getCookie('pp_prov');
    setCookie('pp_prov', prov.slug, 180);

    document.querySelectorAll('[data-pp-prov-label]').forEach(function (el) {
      el.textContent = prov.nombre;
    });
    document.querySelectorAll('[data-pp-prov-link]').forEach(function (el) {
      el.setAttribute('href', '/' + prov.slug);
    });
    document.querySelectorAll('[data-pp-prov-switcher]').forEach(function (sel) {
      if (sel.value !== prov.slug) sel.value = prov.slug;
    });

    if (shouldReloadIfHome && prevSlug !== prov.slug && (location.pathname === '/' || location.pathname === '/for-you')) {
      window.location.reload();
    }
  }

  async function saveLocationOnServer(payload, shouldReload) {
    try {
      var res = await fetch('/api/user/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      var data = await res.json();
      if (data && data.ok && data.province) {
        applyDetectedProvinceToDOM(data.province, shouldReload);
        return data.province;
      }
    } catch (e) {}
    return null;
  }

  // 1. Auto-detección silenciosa cuando el usuario entra sin cookie confirmada
  async function autoDetectZoneIfNeeded() {
    var existingCookie = getCookie('pp_prov');
    if (existingCookie) return;

    // A) Si ya dio permiso de geolocalización GPS al navegador, usarlo directamente
    if (navigator.permissions && navigator.geolocation) {
      try {
        var perm = await navigator.permissions.query({ name: 'geolocation' });
        if (perm && perm.state === 'granted') {
          navigator.geolocation.getCurrentPosition(
            function (pos) {
              saveLocationOnServer({ lat: pos.coords.latitude, lng: pos.coords.longitude }, true);
            },
            function () {},
            { enableHighAccuracy: false, timeout: 4000, maximumAge: 600000 }
          );
          return;
        }
      } catch (e) {}
    }

    // B) Zona horaria Canaria
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz === 'Atlantic/Canary') {
        await saveLocationOnServer({ text: 'las-palmas' }, true);
        return;
      }
    } catch (e) {}

    // C) Consulta GeoIP pública desde el navegador del usuario (detecta IP real del ISP aunque el servidor corra en localhost)
    var providers = [
      {
        url: 'https://ipwho.is/',
        parse: function (d) {
          if (!d || d.success === false) return null;
          return { postal: d.postal, city: d.city, region: d.region, lat: d.latitude, lng: d.longitude, country: d.country_code };
        },
      },
      {
        url: 'https://freeipapi.com/api/json',
        parse: function (d) {
          if (!d) return null;
          return { postal: d.zipCode, city: d.cityName, region: d.regionName, lat: d.latitude, lng: d.longitude, country: d.countryCode };
        },
      },
      {
        url: 'https://ipapi.co/json/',
        parse: function (d) {
          if (!d || d.error) return null;
          return { postal: d.postal, city: d.city, region: d.region, lat: d.latitude, lng: d.longitude, country: d.country_code };
        },
      },
    ];

    for (var i = 0; i < providers.length; i++) {
      try {
        var ctrl = new AbortController();
        var timer = setTimeout(function () { ctrl.abort(); }, 2500);
        var resp = await fetch(providers[i].url, { signal: ctrl.signal });
        clearTimeout(timer);
        if (!resp.ok) continue;
        var raw = await resp.json();
        var info = providers[i].parse(raw);
        if (info && (!info.country || info.country === 'ES')) {
          var resolved = await saveLocationOnServer(info, true);
          if (resolved) return;
        }
      } catch (e) {}
    }
  }

  // 2. Botón de detección GPS exacta a petición del usuario
  function bindGpsButtons() {
    document.querySelectorAll('[data-pp-detect-gps]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!navigator.geolocation) {
          alert('Tu navegador no soporta geolocalización GPS. Introduce tu Código Postal o selecciona tu provincia.');
          return;
        }
        var origText = btn.textContent;
        btn.textContent = 'Detectando GPS...';
        btn.disabled = true;

        navigator.geolocation.getCurrentPosition(
          async function (pos) {
            var prov = await saveLocationOnServer(
              { lat: pos.coords.latitude, lng: pos.coords.longitude },
              false
            );
            btn.disabled = false;
            if (prov) {
              btn.textContent = '📍 ' + prov.nombre;
              window.location.href = '/' + prov.slug;
            } else {
              btn.textContent = origText;
            }
          },
          function () {
            btn.disabled = false;
            btn.textContent = origText;
            var cp = prompt('Introduce tu Código Postal (ej. 28001, 08001, 46001) o nombre de tu ciudad:');
            if (cp && cp.trim()) {
              saveLocationOnServer({ text: cp.trim(), postal: cp.trim() }, false).then(function (prov) {
                if (prov) window.location.href = '/' + prov.slug;
              });
            }
          },
          { enableHighAccuracy: true, timeout: 7000 }
        );
      });
    });

    // Selector rápido de provincia o buscador por Código Postal
    document.querySelectorAll('[data-pp-prov-switcher]').forEach(function (sel) {
      sel.addEventListener('change', async function () {
        var slug = sel.value;
        if (!slug) return;
        await saveLocationOnServer({ provincia_slug: slug }, false);
        window.location.href = '/' + slug;
      });
    });

    var cpForm = document.getElementById('ppZoneQuickForm');
    if (cpForm) {
      cpForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        var input = document.getElementById('ppZoneQuickInput');
        if (!input || !input.value.trim()) return;
        var val = input.value.trim();
        var prov = await saveLocationOnServer({ text: val, postal: val }, false);
        if (prov) {
          window.location.href = '/' + prov.slug;
        } else {
          alert('No hemos reconocido ese código postal o municipio. Prueba con los 5 dígitos de tu Código Postal (ej. 28001).');
        }
      });
    }
  }

  // 3. Autocompletado en vivo para el buscador de SocialsForce (#search-input)
  function bindLiveSearch() {
    var input = document.getElementById('search-input') || document.getElementById('ppSearchInput');
    var dropdown = document.getElementById('ppSearchDropdown');
    if (!input || !dropdown) return;

    var debounceTimer = null;
    input.addEventListener('input', function () {
      var q = input.value.trim();
      clearTimeout(debounceTimer);
      if (q.length < 2) {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
        return;
      }
      debounceTimer = setTimeout(async function () {
        try {
          var res = await fetch('/api/search/suggest?q=' + encodeURIComponent(q));
          if (!res.ok) return;
          var data = await res.json();
          if (!data || !data.ok) return;

          var provSlug = (data.detectedProvince && data.detectedProvince.slug) || 'madrid';
          var provName = (data.detectedProvince && data.detectedProvince.nombre) || 'Madrid';
          var html = '';

          if (data.sectors && data.sectors.length) {
            html += '<div class="pp-sug-group">Secciones en ' + provName + '</div>';
            data.sectors.forEach(function (s) {
              html +=
                '<a class="pp-sug-item" href="/' + provSlug + '/' + s.slug + '">' +
                (s.icono || '•') + ' <strong>' + s.nombre + ' en ' + provName + '</strong>' +
                '<small>Ver páginas y pedir presupuesto →</small></a>';
            });
          }

          if (data.pages && data.pages.length) {
            html += '<div class="pp-sug-group">Páginas recomendadas</div>';
            data.pages.forEach(function (p) {
              html +=
                '<a class="pp-sug-item" href="/article/' + p.slug + '">' +
                '<strong>' + p.title + '</strong>' +
                (p.provincia_nombre ? '<small>· ' + p.provincia_nombre + '</small>' : '') +
                '</a>';
            });
          }

          if (!html) {
            dropdown.style.display = 'none';
            return;
          }
          dropdown.innerHTML = html;
          dropdown.style.display = 'block';
        } catch (e) {}
      }, 160);
    });

    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target) && e.target !== input) {
        dropdown.style.display = 'none';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      bindGpsButtons();
      bindLiveSearch();
      autoDetectZoneIfNeeded();
    });
  } else {
    bindGpsButtons();
    bindLiveSearch();
    autoDetectZoneIfNeeded();
  }
})();
