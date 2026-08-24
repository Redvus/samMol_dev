/**
 * EventBus — шина событий для общения между компонентами
 * @class EventBus
 */
class EventBus {
    constructor() {
        this.events = {};
    }

    /**
     * Подписаться на событие
     * @param {string} event - Название события
     * @param {Function} callback - Функция-обработчик
     * @returns {Function} Функция для отписки
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);

        // Возвращаем функцию для отписки
        return () => this.off(event, callback);
    }

    /**
     * Отписаться от события
     * @param {string} event - Название события
     * @param {Function} callback - Функция-обработчик
     */
    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter((cb) => cb !== callback);
    }

    /**
     * Вызвать событие
     * @param {string} event - Название события
     * @param {*} data - Данные для передачи
     */
    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach((callback) => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event "${event}":`, error);
            }
        });
    }

    /**
     * Подписаться на событие один раз
     * @param {string} event - Название события
     * @param {Function} callback - Функция-обработчик
     */
    once(event, callback) {
        const wrapper = (data) => {
            callback(data);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }

    /**
     * Очистить все события
     * @param {string} event - Название события (опционально)
     */
    clear(event) {
        if (event) {
            delete this.events[event];
        } else {
            this.events = {};
        }
    }

    /**
     * Получить список всех событий
     * @returns {string[]} Список событий
     */
    getEvents() {
        return Object.keys(this.events);
    }

    /**
     * Проверить, есть ли подписчики на событие
     * @param {string} event - Название события
     * @returns {boolean}
     */
    hasListeners(event) {
        return this.events[event] && this.events[event].length > 0;
    }
}

// Создаем один экземпляр на всё приложение
const eventBus = new EventBus();

// Замораживаем, чтобы нельзя было изменить
export default Object.freeze(eventBus);
