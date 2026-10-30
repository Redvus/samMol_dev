/**
 * ImageModal — модальное окно для просмотра изображений
 * @class ImageModal
 */
export default class ImageModal {
    constructor(options = {}) {
        this.config = {
            itemSelector: '[data-gallery-item]',
            modalClass: 'image-modal',
            ...options
        };

        this.items = document.querySelectorAll(this.config.itemSelector);
        this.modal = null;
        this.currentIndex = 0;
        this.isOpen = false;

        this.init = this.init.bind(this);
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.next = this.next.bind(this);
        this.prev = this.prev.bind(this);
        this.destroy = this.destroy.bind(this);
        this.getState = this.getState.bind(this);

        this.init();
    }

    init() {
        if (this.items.length === 0) {
            console.log('ℹ️ ImageModal: элементов не найдено');
            return this;
        }

        this._createModal();
        this._bindEvents();

        console.log(`✅ ImageModal initialized (${this.items.length} изображений)`);
        return this;
    }

    /**
     * Создание модального окна
     * @private
     */
    _createModal() {
        const modal = document.createElement('div');
        modal.className = this.config.modalClass;
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = `
            <div class="image-modal__overlay" data-modal-close></div>
            <div class="image-modal__content">
                <button class="image-modal__close" data-modal-close aria-label="Закрыть">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
                <button class="image-modal__nav image-modal__nav--prev" data-modal-prev aria-label="Предыдущее">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                </button>
                <button class="image-modal__nav image-modal__nav--next" data-modal-next aria-label="Следующее">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>
                <div class="image-modal__image-wrap">
                    <img class="image-modal__image" src="" alt="">
                </div>
                <div class="image-modal__caption">
                    <span class="image-modal__title"></span>
                    <span class="image-modal__counter"></span>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.modal = modal;

        // Кэшируем элементы
        this.imageEl = modal.querySelector('.image-modal__image');
        this.titleEl = modal.querySelector('.image-modal__title');
        this.counterEl = modal.querySelector('.image-modal__counter');
    }

    /**
     * Привязка событий
     * @private
     */
    _bindEvents() {
        // Клик по кнопкам открытия
        this._onItemClick = (e) => {
            const btn = e.currentTarget;
            const index = Array.from(this.items).indexOf(btn);
            this.open(index);
        };

        this.items.forEach(item => {
            item.addEventListener('click', this._onItemClick);
        });

        // Клик по кнопкам закрытия
        this.modal.querySelectorAll('[data-modal-close]').forEach(el => {
            el.addEventListener('click', this.close);
        });

        // Навигация
        this.modal.querySelector('[data-modal-prev]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.prev();
        });
        this.modal.querySelector('[data-modal-next]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.next();
        });

        // Клавиатура
        this._onKeyDown = (e) => {
            if (!this.isOpen) return;
            if (e.key === 'Escape') this.close();
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        };
        document.addEventListener('keydown', this._onKeyDown);

        // Свайп на мобильных
        this._bindSwipe();
    }

    /**
     * Свайпы
     * @private
     */
    _bindSwipe() {
        let startX = 0;
        let startY = 0;

        this.modal.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        this.modal.addEventListener('touchend', (e) => {
            const diffX = e.changedTouches[0].clientX - startX;
            const diffY = e.changedTouches[0].clientY - startY;

            if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) this.prev();
                else this.next();
            }
        }, { passive: true });
    }

    /**
     * Открыть модальное окно
     * @param {number} index - индекс изображения
     */
    open(index = 0) {
        this.currentIndex = index;
        this.isOpen = true;

        this._update();

        this.modal.classList.add('image-modal--open');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
    }

    /**
     * Закрыть модальное окно
     */
    close() {
        this.isOpen = false;
        this.modal.classList.remove('image-modal--open');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
    }

    /**
     * Следующее
     */
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.items.length;
        this._update();
    }

    /**
     * Предыдущее
     */
    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
        this._update();
    }

    /**
     * Обновление содержимого
     * @private
     */
    _update() {
        const item = this.items[this.currentIndex];
        const src = item.dataset.src;
        const title = item.dataset.title || '';

        this.imageEl.src = src;
        this.imageEl.alt = title;
        this.titleEl.textContent = title;
        this.counterEl.textContent = `${this.currentIndex + 1} / ${this.items.length}`;

        // Скрываем навигацию, если одно изображение
        const navs = this.modal.querySelectorAll('.image-modal__nav');
        navs.forEach(nav => {
            nav.style.display = this.items.length <= 1 ? 'none' : '';
        });
    }

    getState() {
        return {
            isOpen: this.isOpen,
            currentIndex: this.currentIndex,
            totalItems: this.items.length,
        };
    }

    destroy() {
        this.items.forEach(item => {
            item.removeEventListener('click', this._onItemClick);
        });

        document.removeEventListener('keydown', this._onKeyDown);

        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }

        this.isOpen = false;
        console.log('🔄 ImageModal destroyed');
    }
}