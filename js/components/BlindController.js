/**
 * BlindController — управление режимом для слабовидящих
 * @class BlindController
 */
export default class BlindController {
    constructor(options = {}) {
        this.config = {
            toggleSelector: '#blindToggle',
            menuSelector: '#blindMenu',
            resetSelector: '#blindReset',
            ...options
        };

        // DOM-элементы
        this.toggle = document.querySelector(this.config.toggleSelector);
        this.menu = document.querySelector(this.config.menuSelector);
        this.resetBtn = document.querySelector(this.config.resetSelector);

        // Состояние
        this.isOpen = false;
        this.isInitialized = false;
        this.settings = this.loadSettings();

        // Привязка методов
        this.toggleMenu = this.toggleMenu.bind(this);
        this.closeMenu = this.closeMenu.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.handleEscape = this.handleEscape.bind(this);
        this.applyFontSize = this.applyFontSize.bind(this);
        this.applyTheme = this.applyTheme.bind(this);
        this.applyContrast = this.applyContrast.bind(this);
        this.applySpacing = this.applySpacing.bind(this);
        this.resetSettings = this.resetSettings.bind(this);
        this.destroy = this.destroy.bind(this);

        this.init();
    }

    init() {
        if (this.isInitialized) return this;

        if (!this.toggle) {
            console.warn('❌ Blind toggle not found');
            return this;
        }

        this._bindEvents();
        this.applySettings();

        this.isInitialized = true;
        console.log('✅ BlindController initialized');

        return this;
    }

    _bindEvents() {
        // Открытие/закрытие меню
        this.toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        // Закрытие по клику вне
        document.addEventListener('click', this.handleClickOutside);

        // Закрытие по ESC
        document.addEventListener('keydown', this.handleEscape);

        // Настройки шрифта
        document.querySelectorAll('[data-font]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const size = btn.dataset.font;
                this.applyFontSize(size);
                this._updateActiveBtn('[data-font]', btn);
            });
        });

        // Настройки темы
        document.querySelectorAll('[data-theme]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.applyTheme(theme);
                this._updateActiveBtn('[data-theme]', btn);
            });
        });

        // Настройки контраста
        document.querySelectorAll('[data-contrast]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const contrast = btn.dataset.contrast;
                this.applyContrast(contrast);
                this._updateActiveBtn('[data-contrast]', btn);
            });
        });

        // Настройки интервала
        document.querySelectorAll('[data-spacing]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const spacing = btn.dataset.spacing;
                this.applySpacing(spacing);
                this._updateActiveBtn('[data-spacing]', btn);
            });
        });

        // Сброс настроек
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', this.resetSettings);
        }
    }

    toggleMenu() {
        this.isOpen = !this.isOpen;
        this.menu?.classList.toggle('is-open', this.isOpen);
        this.toggle?.setAttribute('aria-expanded', this.isOpen);
    }

    closeMenu() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.menu?.classList.remove('is-open');
        this.toggle?.setAttribute('aria-expanded', 'false');
    }

    handleClickOutside(e) {
        const target = e.target;
        const wrapper = this.toggle?.closest('.header__blind-wrapper');

        if (wrapper && !wrapper.contains(target)) {
            this.closeMenu();
        }
    }

    handleEscape(e) {
        if (e.key === 'Escape') {
            this.closeMenu();
        }
    }

    _updateActiveBtn(selector, activeBtn) {
        document.querySelectorAll(selector).forEach((btn) => {
            btn.classList.remove('active');
        });
        activeBtn?.classList.add('active');
    }

    // ============================================
    // НАСТРОЙКИ ШРИФТА
    // ============================================

    applyFontSize(size) {
        const sizes = {
            small: {
                base: '0.8rem',
                h1: '1.8rem',
                h2: '1.5rem',
                h3: '1.2rem'
            },
            medium: {
                base: '1rem',
                h1: '2.2rem',
                h2: '1.8rem',
                h3: '1.4rem'
            },
            large: {
                base: '1.2rem',
                h1: '2.6rem',
                h2: '2.2rem',
                h3: '1.8rem'
            },
            xlarge: {
                base: '1.5rem',
                h1: '3.2rem',
                h2: '2.8rem',
                h3: '2.2rem'
            }
        };

        const config = sizes[size] || sizes.medium;

        document.documentElement.style.setProperty('--font-size-base', config.base);
        document.documentElement.style.setProperty('--font-size-h1', config.h1);
        document.documentElement.style.setProperty('--font-size-h2', config.h2);
        document.documentElement.style.setProperty('--font-size-h3', config.h3);

        this.settings.fontSize = size;
        this._saveSettings();
    }

    // ============================================
    // НАСТРОЙКИ ТЕМЫ
    // ============================================

    applyTheme(theme) {
        const themes = {
            default: {
                background: '#ffffff',
                text: '#1b4669',
                accent: '#1d71b8'
            },
            dark: {
                background: '#000000',
                text: '#ffffff',
                accent: '#ffffff'
            },
            blue: {
                background: '#0a2463',
                text: '#ffffff',
                accent: '#ffd700'
            },
            yellow: {
                background: '#ffd700',
                text: '#000000',
                accent: '#0a2463'
            }
        };

        const config = themes[theme] || themes.default;

        document.documentElement.style.setProperty('--blind-bg', config.background);
        document.documentElement.style.setProperty('--blind-text', config.text);
        document.documentElement.style.setProperty('--blind-accent', config.accent);

        // Применяем к body
        document.body.style.backgroundColor = config.background;
        document.body.style.color = config.text;

        // Применяем к ссылкам
        document.querySelectorAll('a, button').forEach((el) => {
            el.style.color = config.accent;
        });

        this.settings.theme = theme;
        this._saveSettings();
    }

    // ============================================
    // НАСТРОЙКИ КОНТРАСТА
    // ============================================

    applyContrast(contrast) {
        if (contrast === 'high') {
            document.documentElement.style.setProperty('--contrast-strength', '200%');
            document.documentElement.style.filter = 'contrast(200%)';
        } else {
            document.documentElement.style.setProperty('--contrast-strength', '100%');
            document.documentElement.style.filter = 'contrast(100%)';
        }

        this.settings.contrast = contrast;
        this._saveSettings();
    }

    // ============================================
    // НАСТРОЙКИ ИНТЕРВАЛА
    // ============================================

    applySpacing(spacing) {
        if (spacing === 'large') {
            document.documentElement.style.setProperty('--body-line-height', '2');
            document.documentElement.style.setProperty('--heading-line-height', '1.5');
            document.documentElement.style.setProperty('--marginBase', '1.5rem');
        } else {
            document.documentElement.style.setProperty('--body-line-height', '1.4');
            document.documentElement.style.setProperty('--heading-line-height', '1');
            document.documentElement.style.setProperty('--marginBase', '1rem');
        }

        this.settings.spacing = spacing;
        this._saveSettings();
    }

    // ============================================
    // СБРОС НАСТРОЕК
    // ============================================

    resetSettings() {
        // Сброс шрифта
        this.applyFontSize('medium');
        document.querySelectorAll('[data-font]').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.font === 'medium');
        });

        // Сброс темы
        this.applyTheme('default');
        document.querySelectorAll('[data-theme]').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.theme === 'default');
        });

        // Сброс контраста
        this.applyContrast('normal');
        document.querySelectorAll('[data-contrast]').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.contrast === 'normal');
        });

        // Сброс интервала
        this.applySpacing('normal');
        document.querySelectorAll('[data-spacing]').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.spacing === 'normal');
        });

        // Сброс CSS-переменных
        document.documentElement.style.setProperty('--blind-bg', '');
        document.documentElement.style.setProperty('--blind-text', '');
        document.documentElement.style.setProperty('--blind-accent', '');
        document.documentElement.style.setProperty('--contrast-strength', '');
        document.documentElement.style.filter = '';

        document.body.style.backgroundColor = '';
        document.body.style.color = '';

        document.querySelectorAll('a, button').forEach((el) => {
            el.style.color = '';
        });

        this.settings = {};
        this._saveSettings();
        this.closeMenu();

        console.log('🔄 Settings reset');
    }

    // ============================================
    // СОХРАНЕНИЕ И ЗАГРУЗКА НАСТРОЕК
    // ============================================

    loadSettings() {
        try {
            const saved = localStorage.getItem('blindSettings');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    }

    _saveSettings() {
        try {
            localStorage.setItem('blindSettings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Could not save settings:', e);
        }
    }

    applySettings() {
        if (this.settings.fontSize) {
            this.applyFontSize(this.settings.fontSize);
            document.querySelectorAll('[data-font]').forEach((btn) => {
                btn.classList.toggle('active', btn.dataset.font === this.settings.fontSize);
            });
        }

        if (this.settings.theme) {
            this.applyTheme(this.settings.theme);
            document.querySelectorAll('[data-theme]').forEach((btn) => {
                btn.classList.toggle('active', btn.dataset.theme === this.settings.theme);
            });
        }

        if (this.settings.contrast) {
            this.applyContrast(this.settings.contrast);
            document.querySelectorAll('[data-contrast]').forEach((btn) => {
                btn.classList.toggle('active', btn.dataset.contrast === this.settings.contrast);
            });
        }

        if (this.settings.spacing) {
            this.applySpacing(this.settings.spacing);
            document.querySelectorAll('[data-spacing]').forEach((btn) => {
                btn.classList.toggle('active', btn.dataset.spacing === this.settings.spacing);
            });
        }
    }

    // ============================================
    // PUBLIC METHODS
    // ============================================

    getState() {
        return {
            isOpen: this.isOpen,
            isInitialized: this.isInitialized,
            settings: this.settings
        };
    }

    destroy() {
        if (!this.isInitialized) return;

        document.removeEventListener('click', this.handleClickOutside);
        document.removeEventListener('keydown', this.handleEscape);

        this.isInitialized = false;
        console.log('🔄 BlindController destroyed');
    }
}