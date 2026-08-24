/**
 * App — главный класс приложения
 * @class App
 */
class App {
    constructor(options = {}) {
        // Настройки
        this.config = {
            debug: options.debug || false,
            autoInit: options.autoInit !== false,
            ...options
        };

        // Компоненты
        this.components = {};

        // Состояние приложения
        this.isInitialized = false;
        this.startTime = null;

        // Привязка методов
        this.init = this.init.bind(this);
        this.destroy = this.destroy.bind(this);
        this.register = this.register.bind(this);
        this.get = this.get.bind(this);

        // Автоматическая инициализация
        if (this.config.autoInit) {
            this.init();
        }
    }

    /**
     * Инициализация приложения
     * @returns {App} Экземпляр для цепочки вызовов
     */
    init() {
        if (this.isInitialized) {
            this._log('⚠️ App already initialized');
            return this;
        }

        this.startTime = performance.now();
        this._log('🚀 Initializing App...');

        // Инициализация всех зарегистрированных компонентов
        this._initComponents();

        // Подписка на глобальные события
        this._bindEvents();

        this.isInitialized = true;
        this._log(`✅ App initialized in ${(performance.now() - this.startTime).toFixed(2)}ms`);

        // Эмитим событие о готовности
        this._emit('app:ready', {
            components: Object.keys(this.components),
            time: performance.now() - this.startTime
        });

        return this;
    }

    /**
     * Инициализация компонентов
     * @private
     */
    _initComponents() {
        // Компоненты регистрируются через метод register
        // или через data-атрибуты на элементах
        this._autoDiscoverComponents();
    }

    /**
     * Автообнаружение компонентов по data-атрибутам
     * @private
     */
    _autoDiscoverComponents() {
        // Ищем элементы с data-component
        const elements = document.querySelectorAll('[data-component]');

        elements.forEach((element) => {
            const name = element.dataset.component;
            const config = element.dataset.config ? JSON.parse(element.dataset.config) : {};

            // Если компонент уже зарегистрирован — пропускаем
            if (this.components[name]) return;

            this._log(`🔍 Auto-discovered component: ${name}`);

            // Здесь можно динамически импортировать компоненты
            // или использовать заранее зарегистрированные
        });
    }

    /**
     * Подписка на события
     * @private
     */
    _bindEvents() {
        // Слушаем события от компонентов через EventBus
        // (компоненты сами эмитят события)

        // Обработка ошибок
        window.addEventListener('error', (e) => {
            this._emit('app:error', {
                message: e.message,
                file: e.filename,
                line: e.lineno
            });
        });

        // Обработка beforeunload
        window.addEventListener('beforeunload', () => {
            this._emit('app:beforeunload', {});
        });

        // Обработка DOMContentLoaded (если приложение создано раньше)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this._emit('app:domready', {});
            });
        } else {
            this._emit('app:domready', {});
        }
    }

    /**
     * Зарегистрировать компонент
     * @param {string} name - Имя компонента
     * @param {Object} component - Экземпляр компонента
     * @param {Object} options - Настройки
     * @returns {App} Экземпляр для цепочки вызовов
     */
    register(name, component, options = {}) {
        if (this.components[name]) {
            this._log(`⚠️ Component "${name}" already registered`);
            return this;
        }

        this.components[name] = component;

        // Если компонент имеет метод init и не инициализирован
        if (component.init && !component.isInitialized) {
            component.init(options);
        }

        this._log(`✅ Component registered: ${name}`);
        this._emit('app:componentRegistered', { name, component });

        return this;
    }

    /**
     * Получить компонент по имени
     * @param {string} name - Имя компонента
     * @returns {Object|null} Экземпляр компонента или null
     */
    get(name) {
        return this.components[name] || null;
    }

    /**
     * Получить все компоненты
     * @returns {Object} Объект со всеми компонентами
     */
    getAll() {
        return { ...this.components };
    }

    /**
     * Получить состояние всех компонентов
     * @returns {Object} Состояние всех компонентов
     */
    getState() {
        const state = {
            app: {
                isInitialized: this.isInitialized,
                startTime: this.startTime,
                uptime: this.startTime ? performance.now() - this.startTime : 0
            },
            components: {}
        };

        for (const [name, component] of Object.entries(this.components)) {
            if (typeof component.getState === 'function') {
                state.components[name] = component.getState();
            } else {
                state.components[name] = {
                    isInitialized: component.isInitialized !== undefined
                        ? component.isInitialized
                        : true
                };
            }
        }

        return state;
    }

    /**
     * Вызвать метод у всех компонентов
     * @param {string} method - Имя метода
     * @param {...*} args - Аргументы
     * @returns {Object} Результаты вызовов
     */
    invoke(method, ...args) {
        const results = {};

        for (const [name, component] of Object.entries(this.components)) {
            if (typeof component[method] === 'function') {
                try {
                    results[name] = component[method](...args);
                } catch (error) {
                    results[name] = { error: error.message };
                    this._log(`❌ Error invoking "${method}" on "${name}":`, error);
                }
            }
        }

        return results;
    }

    /**
     * Эмит события через EventBus
     * @private
     * @param {string} event - Название события
     * @param {*} data - Данные
     */
    async _emit(event, data) {
        try {
            const { default: eventBus } = await import('./EventBus.js');
            eventBus.emit(event, data);
        } catch (error) {
            // Если EventBus не загружен, используем нативный CustomEvent
            const customEvent = new CustomEvent(event, { detail: data });
            document.dispatchEvent(customEvent);
        }
    }

    /**
     * Логирование
     * @private
     */
    _log(...args) {
        if (this.config.debug) {
            console.log('[App]', ...args);
        }
    }

    /**
     * Дестрой приложения
     * @returns {App} Экземпляр для цепочки вызовов
     */
    destroy() {
        if (!this.isInitialized) return this;

        this._log('🔄 Destroying App...');

        // Дестрой всех компонентов
        for (const [name, component] of Object.entries(this.components)) {
            if (typeof component.destroy === 'function') {
                try {
                    component.destroy();
                    this._log(`🔄 Component "${name}" destroyed`);
                } catch (error) {
                    this._log(`❌ Error destroying "${name}":`, error);
                }
            }
        }

        // Очистка
        this.components = {};
        this.isInitialized = false;
        this.startTime = null;

        // Эмитим событие
        this._emit('app:destroyed', {});

        this._log('✅ App destroyed');
        return this;
    }

    /**
     * Версия приложения
     * @returns {string} Версия
     */
    get version() {
        return '1.0.0';
    }
}

// Экспорт по умолчанию
export default App;