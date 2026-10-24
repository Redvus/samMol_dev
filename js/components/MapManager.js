/**
 * MapManager — управление всеми картами на странице
 * @class MapManager
 */
export default class MapManager {
    constructor(options = {}) {
        this.config = {
            selector: '[data-map]',
            apiKey: '',
            ...options
        };

        this.maps = new Map();
        this.isInitialized = false;

        this.init = this.init.bind(this);
        this.destroy = this.destroy.bind(this);

        this.init();
    }

    init() {
        if (this.isInitialized) return this;

        const mapElements = document.querySelectorAll(this.config.selector);
        if (mapElements.length === 0) {
            console.log('ℹ️ MapManager: карты не найдены');
            return this;
        }

        console.log(`🎯 Найдено карт: ${mapElements.length}`);

        // Загружаем API если нужно
        if (typeof ymaps === 'undefined') {
            this._loadYmapsApi().then(() => {
                this._initAllMaps();
            });
        } else {
            ymaps.ready(() => {
                this._initAllMaps();
            });
        }

        return this;
    }

    _loadYmapsApi() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU${this.config.apiKey ? '&apikey=' + this.config.apiKey : ''}`;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    _initAllMaps() {
        document.querySelectorAll(this.config.selector).forEach((element, index) => {
            const id = element.id || `map_${index}`;

            // Получаем настройки из data-атрибутов
            const center = element.dataset.center
                ? element.dataset.center.split(',').map(Number)
                : [53.225631, 50.180304];
            const zoom = parseInt(element.dataset.zoom) || 12;
            const title = element.dataset.title || '';

            try {
                const map = new ymaps.Map(id, {
                    center: center,
                    zoom: zoom,
                    type: 'yandex#map',
                    controls: ['zoomControl', 'fullscreenControl'],
                });

                map.behaviors.disable('scrollZoom');

                if (title) {
                    const placemark = new ymaps.Placemark(center, {
                        hintContent: title,
                        balloonContent: title,
                    }, {
                        preset: 'islands#blueIcon',
                    });
                    map.geoObjects.add(placemark);
                }

                this.maps.set(id, map);
                console.log(`✅ Карта "${id}" создана`);

            } catch (error) {
                console.error(`❌ Ошибка создания карты "${id}"`, error);
            }
        });

        this.isInitialized = true;
    }

    getState() {
        return {
            isInitialized: this.isInitialized,
            mapsCount: this.maps.size,
        };
    }

    destroy() {
        this.maps.forEach(map => map.destroy());
        this.maps.clear();
        this.isInitialized = false;
    }
}