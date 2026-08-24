// ============================================
// main.js — Точка входа
// ============================================

// Импорт ядра
import App from "./core/App.js";
import eventBus from "./core/EventBus.js";

// Импорт компонентов
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

    // Хедер — всегда
    app.register(
        "header",
        new HeaderController({
            scrollThreshold: 50,
            debounceDelay: 30,
        }),
    );

    // Форма — инициализируется только если есть на странице
    app.register(
        "form",
        new FormRetail({
            maxBooks: 4,
        }),
    );

    // Инициализация слайдера
    initSliderWithObserver(app);

    // Инициализация приложения
    app.init();

    window.app = app;
    window.eventBus = eventBus;

    return app;
}

/**
 * Инициализация слайдера через MutationObserver
 */
function initSliderWithObserver(app) {
    // Функция для инициализации слайдера
    const tryInitSlider = () => {
        const sliderElement = document.querySelector('[data-slider="true"]');
        if (!sliderElement) return false;

        // Проверяем наличие данных
        const slidesData = sliderElement.dataset.slides;
        const autoplay = sliderElement.dataset.autoplay !== "false";
        if (!slidesData || slidesData === "[]" || slidesData === "") {
            console.log("ℹ️ Slider: данные не загружены");
            return false;
        }

        try {
            const slider = new InfiniteSlider(sliderElement, {
                autoplay: autoplay,
            });
            app.register("slider", slider);
            console.log("✅ Slider registered successfully");
            return true;
        } catch (error) {
            console.error("❌ Slider initialization error:", error);
            return false;
        }
    };

    // Пробуем сразу
    if (tryInitSlider()) return;

    // Создаем MutationObserver для отслеживания появления слайдера
    const observer = new MutationObserver(() => {
        if (tryInitSlider()) {
            observer.disconnect();
            console.log(
                "🔄 MutationObserver: слайдер найден и инициализирован",
            );
        }
    });

    // Начинаем наблюдение за изменениями в DOM
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    // Таймаут для остановки наблюдения через 10 секунд
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

// ============================================
// ДОСТУП ИЗ КОНСОЛИ
// ============================================
console.log("📌 App: window.app");
console.log("📌 Components: window.app?.getAll()");

// Экспорт для модулей
export { App, eventBus };
export default App;
