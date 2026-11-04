/**
 * SOCIALSFORCE / PIDEPRECIO.ES
 * Main JavaScript
 */


/* =========================================
   FALLBACK DE IMÁGENES ROTAS
========================================= */

(function initImageFallback() {
    const FALLBACK_SRC = "/images/noimage.jpg";

    function applyFallback(img) {
        if (!img || img.tagName !== "IMG") return;
        if (img.dataset.fallbackApplied === "1") return;
        img.dataset.fallbackApplied = "1";
        img.src = FALLBACK_SRC;
    }

    // Captura global para cualquier imagen que falle al cargar
    window.addEventListener(
        "error",
        (event) => {
            const target = event.target;
            if (target && target.tagName === "IMG") {
                applyFallback(target);
            }
        },
        true
    );

    // Revisar imágenes que ya hayan fallado antes de cargar este script
    function checkExistingImages() {
        document.querySelectorAll("img").forEach((img) => {
            if (!img.getAttribute("src")) {
                applyFallback(img);
            } else if (img.complete && img.naturalWidth === 0) {
                applyFallback(img);
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", checkExistingImages);
    } else {
        checkExistingImages();
    }
})();


/* =========================================
   ELEMENTS
========================================= */

const searchButton = document.getElementById("search-button");
const searchContainer = document.getElementById("search-container");
const searchInput = document.getElementById("search-input");

const categoriesButton = document.getElementById("categories-button");
const categoriesMenu = document.getElementById("categories-menu");

const mobileMenuButton = document.getElementById("mobile-menu-button");
const mobileNavigation = document.getElementById("mobile-navigation");


/* =========================================
   SEARCH
========================================= */

if (searchButton && searchContainer) {
    searchButton.addEventListener("click", () => {
        searchContainer.classList.toggle("active");
        if (searchContainer.classList.contains("active") && searchInput) {
            searchInput.focus();
        }
    });
}


/* =========================================
   CATEGORIES
========================================= */

if (categoriesButton && categoriesMenu) {
    categoriesButton.addEventListener("click", (event) => {
        event.stopPropagation();
        categoriesMenu.classList.toggle("active");
        const isOpen = categoriesMenu.classList.contains("active");
        categoriesButton.setAttribute("aria-expanded", isOpen);
    });

    categoriesMenu.addEventListener("click", (event) => {
        event.stopPropagation();
    });
}

document.addEventListener("click", () => {
    if (categoriesMenu) {
        categoriesMenu.classList.remove("active");
    }
    if (categoriesButton) {
        categoriesButton.setAttribute("aria-expanded", "false");
    }
});


/* =========================================
   MOBILE MENU
========================================= */

if (mobileMenuButton && mobileNavigation) {
    mobileMenuButton.addEventListener("click", (event) => {
        event.stopPropagation();
        mobileNavigation.classList.toggle("active");
    });
}
