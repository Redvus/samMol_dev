/**
 * Preloader — прелоадер с плавным исчезновением
 * @class Preloader
 */
export default class Preloader {
    constructor(options = {}) {
        this.config = {
            selector: '#preloader',
            minDuration: 500,      // минимальное время показа (мс)
            fadeOutDuration: 500,  // длительность исчезновения (мс)
            autoHide: true,        // скрывать автоматически
            ...options
        };

        this.preloader = document.querySelector(this.config.selector);
        this.startTime = Date.now();
        this.isInitialized = false;
        this.isHidden = false;

        this.init = this.init.bind(this);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);
        this.destroy = this.destroy.bind(this);
        this.getState = this.getState.bind(this);

        this.init();
    }

    init() {
        if (this.isInitialized) {
            console.warn('⚠️ Preloader already initialized');
            return this;
        }

        if (!this.preloader) {
            console.log('ℹ️ Preloader: элемент не найден');
            return this;
        }

        // Убираем инлайн-стиль display:none, если он есть
        this.preloader.style.display = '';

        this.isInitialized = true;
        console.log('✅ Preloader initialized');

        if (this.config.autoHide) {
            this._autoHide();
        }

        return this;
    }

    /**
     * Автоматическое скрытие при загрузке страницы
     * @private
     */
    _autoHide() {
        const hideWhenReady = () => {
            const elapsed = Date.now() - this.startTime;
            const remaining = Math.max(0, this.config.minDuration - elapsed);

            setTimeout(() => {
                this.hide();
            }, remaining);
        };

        if (document.readyState === 'complete') {
            hideWhenReady();
        } else {
            window.addEventListener('load', hideWhenReady, { once: true });
        }
    }

    /**
     * Скрыть прелоадер
     */
    hide() {
        if (!this.preloader || this.isHidden) return;

        this.isHidden = true;
        this.preloader.classList.add('preloader--hidden');

        // Блокируем события
        this.preloader.style.pointerEvents = 'none';

        // Удаляем из DOM после анимации
        setTimeout(() => {
            if (this.preloader && this.preloader.parentNode) {
                this.preloader.style.display = 'none';
            }
            this.preloader?.dispatchEvent(new Event('preloader:hidden'));
        }, this.config.fadeOutDuration);
    }

    /**
     * Показать прелоадер
     */
    show() {
        if (!this.preloader) return;

        this.isHidden = false;
        this.preloader.style.display = '';
        this.preloader.style.pointerEvents = 'auto';

        // Форсируем перерисовку
        void this.preloader.offsetHeight;

        this.preloader.classList.remove('preloader--hidden');
        this.preloader.dispatchEvent(new Event('preloader:shown'));
    }

    getState() {
        return {
            isInitialized: this.isInitialized,
            isHidden: this.isHidden,
            hasElement: !!this.preloader,
        };
    }

    destroy() {
        if (!this.isInitialized) return;
        this.isInitialized = false;
        console.log('🔄 Preloader destroyed');
    }
}