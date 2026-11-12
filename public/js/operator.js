(function() {
    function isMobileDevice() {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 768;
    }

    window.openOperatorModal = function(ev) {
        // En móviles, permitir que el enlace tel: se abra nativamente en el marcador del teléfono
        if (isMobileDevice() && ev && ev.target && ev.target.closest('a[href^="tel:"]')) {
            return;
        }

        if (ev && typeof ev.preventDefault === 'function') {
            ev.preventDefault();
        }

        var overlay = document.getElementById('operatorModalOverlay');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeOperatorModal = function() {
        var overlay = document.getElementById('operatorModalOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    window.copyOperatorPhone = function(btn) {
        var phoneEl = document.getElementById('operatorModalPhoneText');
        var phone = phoneEl ? phoneEl.textContent.trim() : '+34 622 15 87 03';
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(phone).then(function() {
                if (btn) {
                    var prev = btn.textContent;
                    btn.textContent = '✅ ¡Copiado!';
                    setTimeout(function() { btn.textContent = prev; }, 2000);
                }
            });
        }
    };

    document.addEventListener('DOMContentLoaded', function() {
        document.addEventListener('click', function(e) {
            var trigger = e.target.closest('[data-open-operator-modal]');
            if (trigger) {
                // Solo abrir modal en pantallas de escritorio
                if (!isMobileDevice()) {
                    e.preventDefault();
                    window.openOperatorModal(e);
                }
            }

            var closeBtn = e.target.closest('[data-close-operator-modal]');
            if (closeBtn) {
                e.preventDefault();
                window.closeOperatorModal();
            }

            var overlay = document.getElementById('operatorModalOverlay');
            if (e.target === overlay) {
                window.closeOperatorModal();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                window.closeOperatorModal();
            }
        });
    });
})();
