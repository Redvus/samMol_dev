// ============================================
// main.js — Точка входа
// ============================================

import App from "./core/App.js";
import eventBus from "./core/EventBus.js";
import HeaderController from "./components/HeaderController.js";
import FormRetail from "./components/FormRetail.js";
import InfiniteSlider from "./components/InfiniteSlider.js";

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
            debounceDelay: 30,
        }),
    );

    // Форма
    app.register(
        "form",
        new FormRetail({
            maxBooks: 4,
        }),
    );

    // 🔥 Инициализация ВСЕХ слайдеров на странице
    initAllSliders(app);

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

// ============================================
// ЗАПУСК
// ============================================

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createApp);
} else {
    createApp();
}

console.log("📌 App: window.app");
console.log("📌 Components: window.app?.getAll()");

export { App, eventBus };
export default App;