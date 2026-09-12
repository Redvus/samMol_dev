// ============================================
// main.js — Точка входа
// ============================================

import App from "./core/App.js";
import eventBus from "./core/EventBus.js";
import HeaderController from "./components/HeaderController.js";
import FormRetail from "./components/FormRetailSimple.js";
import InfiniteSlider from "./components/InfiniteSlider.js";
import BlindController from "./components/BlindController.js";
import PdfGenerator from "./components/PdfGenerator.js";
import initTableValidation from "./components/TableValidation.js";
import MobileMenu from './components/MobileMenu.js';

// ============================================
// СОЗДАНИЕ ПРИЛОЖЕНИЯ
// ============================================

function createApp() {
    if (window.app) {
        console.warn("⚠️ App already exists");
        return window.app;
    }

    const app = new App({
        debug: true,
        autoInit: false,
    });

    // Хедер
    app.register(
        "header",
        new HeaderController({
            scrollThreshold: 50,
            debounceDelay: 15,
        }),
    );

    // Форма
    app.register(
        "form",
        new FormRetail({
            maxBooks: 5,
        }),
    );

    // 🔥 Инициализация ВСЕХ слайдеров на странице
    initAllSliders(app);

    initTableValidation();

    // 🔥 PDF генератор
    app.register(
        "pdf",
        new PdfGenerator({
            formSelector: '#formRetail',
            checkboxSelector: '#generatePdf',
            pdfUrl: '/assets/snippets/generatePDF.php',
            debug: true,
        }),
    );

    // 🔥 Блок для слабовидящих
    app.register(
        "blind",
        new BlindController({
            toggleSelector: '#blindToggle',
            menuSelector: '#blindMenu',
            resetSelector: '#blindReset',
        }),
    );

    app.register(
        "blind",
        new BlindController({
            toggleSelector: '#blindToggleMobile',
            menuSelector: '#blindMenu',
            resetSelector: '#blindReset',
            overlaySelector: '.blind-menu__overlay'
        }),
    );

    app.register(
        "mobileMenu",
        new MobileMenu({
            buttonSelector: '#buttonMobile',
            menuSelector: '.header-mobile__nav',
            overlaySelector: '.header-mobile__overlay', // можно передать существующий
            activeClass: 'is-open',
            overlayActiveClass: 'is-visible',
            animationDuration: 300,
        }),
    );

    initMobile(app);

    app.init();

    window.app = app;
    window.eventBus = eventBus;

    return app;
}

/**
 * Инициализация всех слайдеров на странице
 */
function initAllSliders(app) {
    const sliderElements = document.querySelectorAll('[data-slider]');

    if (sliderElements.length === 0) {
        console.log("ℹ️ Sliders: не найдены на странице");
        return;
    }

    console.log(`🎯 Найдено слайдеров: ${sliderElements.length}`);

    sliderElements.forEach((element, index) => {
        const sliderId = element.dataset.slider || index + 1;

        // Проверяем данные
        const slidesData = element.dataset.slides;
        if (!slidesData || slidesData === "[]" || slidesData === "") {
            console.log(`ℹ️ Slider ${sliderId}: данные не загружены`);
            return;
        }

        // Проверяем autoplay
        const autoplay = element.dataset.autoplay !== "false";

        try {
            const slider = new InfiniteSlider(element, {
                autoplay: autoplay,
                autoplayDelay: parseInt(element.dataset.autoplayDelay) || 4000,
            });

            const name = `slider_${sliderId}`;
            app.register(name, slider);
            console.log(`✅ Slider "${name}" registered (autoplay: ${autoplay ? 'ON' : 'OFF'})`);
        } catch (error) {
            console.error(`❌ Slider ${sliderId} initialization error:`, error);
        }
    });
}

/**
 * Альтернативная инициализация через MutationObserver
 */
function initSlidersWithObserver(app) {
    const tryInitSliders = () => {
        const elements = document.querySelectorAll('[data-slider]');
        if (elements.length === 0) return false;

        let initialized = 0;
        elements.forEach((element, index) => {
            const sliderId = element.dataset.slider || index + 1;
            const slidesData = element.dataset.slides;

            if (!slidesData || slidesData === "[]" || slidesData === "") {
                return;
            }

            // Проверяем, не инициализирован ли уже
            const name = `slider_${sliderId}`;
            if (app.get(name)) return;

            const autoplay = element.dataset.autoplay !== "false";

            try {
                const slider = new InfiniteSlider(element, {
                    autoplay: autoplay,
                    autoplayDelay: parseInt(element.dataset.autoplayDelay) || 4000,
                });
                app.register(name, slider);
                initialized++;
            } catch (error) {
                console.error(`❌ Slider ${sliderId} error:`, error);
            }
        });

        return initialized > 0;
    };

    // Пробуем сразу
    if (tryInitSliders()) return;

    // MutationObserver для отслеживания появления слайдеров
    const observer = new MutationObserver(() => {
        if (tryInitSliders()) {
            observer.disconnect();
            console.log("🔄 MutationObserver: все слайдеры инициализированы");
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    setTimeout(() => {
        observer.disconnect();
        console.log("ℹ️ MutationObserver: остановлен по таймауту");
    }, 10000);
}

function initMobile(app) {
    /* Mobile */
    const wrapperMobile = document.querySelector('.wrapper');
    const headerDesktop = document.getElementById('headerDesktop');
    const headerMobile = document.getElementById('headerMobile');
    const headerFixed = document.getElementById('headerFixed');

    const footerDesktop = document.getElementById('footerDesktop');
    const footerMobile = document.getElementById('footerMobile');

    if (document.body.clientWidth < 820 || screen.width < 820) {
        headerDesktop.style.opacity = '0';
        headerDesktop.style.display = 'none';
        headerDesktop.style.visibility = 'hidden';

        headerFixed.style.opacity = '0';
        headerFixed.style.display = 'none';
        headerFixed.style.visibility = 'hidden';

        headerMobile.style.opacity = '1';
        headerMobile.style.visibility = 'visible';

        footerDesktop.style.opacity = '0';
        footerDesktop.style.display = 'none';
        footerDesktop.style.visibility = 'hidden';

        footerMobile.style.opacity = '1';
        footerMobile.style.visibility = 'visible';

    } else if (document.body.clientWidth > 820 || screen.width > 820) {
        headerDesktop.style.opacity = '1';
        headerDesktop.style.display = 'flex';
        headerDesktop.style.visibility = 'visible';

        headerFixed.style.opacity = '1';
        headerFixed.style.display = 'flex';
        headerFixed.style.visibility = 'visible';

        headerMobile.style.opacity = '0';
        headerMobile.style.visibility = 'hidden';

        footerDesktop.style.opacity = '1';
        footerDesktop.style.display = 'flex';
        footerDesktop.style.visibility = 'visible';

        footerMobile.style.opacity = '0';
        footerMobile.style.display = 'none';
        footerMobile.style.visibility = 'hidden';
    }
}

// ============================================
// ЗАПУСК
// ============================================

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createApp);
} else {
    createApp();
}

// console.log("📌 App: window.app");
// console.log("📌 Components: window.app?.getAll()");

export { App, eventBus };
export default App;