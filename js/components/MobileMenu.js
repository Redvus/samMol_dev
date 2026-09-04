/**
 * MobileMenu — управление мобильным меню с анимацией и оверлеем
 * @class MobileMenu
 */
export default class MobileMenu {
    constructor(options = {}) {
        this.config = {
            buttonSelector: '#buttonMobile',
            menuSelector: '.header-mobile__nav',
            overlaySelector: '.header-mobile__overlay',
            activeClass: 'is-open',
            overlayActiveClass: 'is-visible',
            animationDuration: 300,
            ...options
        };

        this.button = document.querySelector(this.config.buttonSelector);
        this.menu = document.querySelector(this.config.menuSelector);
        this.overlay = document.querySelector(this.config.overlaySelector);
        this.body = document.body;

        this.isOpen = false;
        this.isAnimating = false;
        this.isInitialized = false;

        this.init = this.init.bind(this);
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.toggle = this.toggle.bind(this);
        this.destroy = this.destroy.bind(this);
        this.getState = this.getState.bind(this);

        this.init();
    }

    init() {
        if (this.isInitialized) {
            console.warn('⚠️ MobileMenu already initialized');
            return this;
        }

        if (!this.button || !this.menu) {
            console.log('ℹ️ MobileMenu: кнопка или меню не найдены');
            return this;
        }

        // Создаем оверлей, если его нет
        if (!this.overlay) {
            this._createOverlay();
        }

        this._bindEvents();
        this.isInitialized = true;
        console.log('✅ MobileMenu initialized');

        return this;
    }

    /**
     * Создание оверлея
     * @private
     */
    _createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'header-mobile__overlay';
        overlay.setAttribute('aria-hidden', 'true');
        // overlay.style.cssText = `
        //     position: fixed;
        //     top: 0;
        //     left: 0;
        //     width: 100%;
        //     height: 100%;
        //     background: rgba(0, 0, 0, 0.5);
        //     backdrop-filter: blur(4px);
        //     z-index: 9800;
        //     opacity: 0;
        //     visibility: hidden;
        //     transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1),
        //                 visibility 300ms cubic-bezier(0.4, 0, 0.2, 1);
        //     cursor: pointer;
        // `;

        // Вставляем перед меню
        this.menu.parentNode.insertBefore(overlay, this.menu);
        this.overlay = overlay;
        console.log('✅ MobileMenu: оверлей создан');
    }

    _bindEvents() {
        // Клик по кнопке
        this.button.addEventListener('click', this.toggle);

        // Клик по оверлею — закрытие
        if (this.overlay) {
            this.overlay.addEventListener('click', this.close);
        }

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Закрытие при ресайзе на десктоп
        window.addEventListener('resize', () => {
            if (window.innerWidth > 810 && this.isOpen) {
                this.close();
            }
        });

        // Закрытие при клике на ссылку в меню
        this.menu.addEventListener('click', (e) => {
            if (e.target.closest('a')) {
                this.close();
            }
        });
    }

    /**
     * Открыть меню
     */
    open() {
        if (this.isOpen || this.isAnimating) return;

        this.isAnimating = true;

        // Показываем оверлей
        if (this.overlay) {
            this.overlay.style.visibility = 'visible';
            this.overlay.style.opacity = '1';
            this.overlay.classList.add(this.config.overlayActiveClass);
        }

        // Показываем меню
        this.menu.style.display = 'flex';
        this.menu.style.visibility = 'visible';
        void this.menu.offsetHeight;
        this.menu.classList.add(this.config.activeClass);

        this.button.setAttribute('aria-expanded', 'true');
        this.body.classList.add('no-scroll');

        this._toggleIcon(true);
        this.isOpen = true;

        setTimeout(() => {
            this.isAnimating = false;
        }, this.config.animationDuration);
    }

    /**
     * Закрыть меню
     */
    close() {
        if (!this.isOpen || this.isAnimating) return;

        this.isAnimating = true;

        // Скрываем меню
        this.menu.classList.remove(this.config.activeClass);

        // Скрываем оверлей
        if (this.overlay) {
            this.overlay.style.opacity = '0';
            this.overlay.classList.remove(this.config.overlayActiveClass);
        }

        this.button.setAttribute('aria-expanded', 'false');
        this.body.classList.remove('no-scroll');

        this._toggleIcon(false);
        this.isOpen = false;

        setTimeout(() => {
            this.menu.style.display = 'none';
            this.menu.style.visibility = 'hidden';

            if (this.overlay) {
                this.overlay.style.visibility = 'hidden';
            }

            this.isAnimating = false;
        }, this.config.animationDuration);
    }

    /**
     * Переключить меню
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Переключить иконку
     * @param {boolean} isOpen
     * @private
     */
    _toggleIcon(isOpen) {
        const icon = this.button.querySelector('i');
        if (!icon) return;

        if (isOpen) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    }

    /**
     * Получить состояние
     * @returns {Object}
     */
    getState() {
        return {
            isOpen: this.isOpen,
            isAnimating: this.isAnimating,
            isInitialized: this.isInitialized,
            hasOverlay: !!this.overlay,
        };
    }

    /**
     * Дестрой
     */
    destroy() {
        if (!this.isInitialized) return;

        this.button.removeEventListener('click', this.toggle);
        if (this.overlay) {
            this.overlay.removeEventListener('click', this.close);
        }

        if (this.isOpen) {
            this.menu.classList.remove(this.config.activeClass);
            this.menu.style.display = 'none';
            this.menu.style.visibility = 'hidden';

            if (this.overlay) {
                this.overlay.classList.remove(this.config.overlayActiveClass);
                this.overlay.style.opacity = '0';
                this.overlay.style.visibility = 'hidden';
            }

            this.body.classList.remove('no-scroll');
            this.button.setAttribute('aria-expanded', 'false');
            this.isOpen = false;
        }

        this.isInitialized = false;
        console.log('🔄 MobileMenu destroyed');
    }
}