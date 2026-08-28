// ============================================
// components/HeaderController.js
// ============================================

import eventBus from "../core/EventBus.js";

export default class HeaderController {
    constructor(options = {}) {
        this.config = {
            headerSelector: "#headerFixed",
            closeSelector: "#headerFixedClose",
            scrollThreshold: 200,
            debounceDelay: 100,
            ...options,
        };

        // DOM
        this.header = document.querySelector(this.config.headerSelector);
        this.closeBtn = document.querySelector(this.config.closeSelector);

        // Состояния
        this.isVisible = false;
        this.isManuallyClosed = false;
        this.isInitialized = false;
        this.lastScrollY = window.scrollY;
        this.scrollTimeout = null;
        this.resizeTimeout = null;

        // Привязка методов
        this.handleScroll = this.handleScroll.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.toggle = this.toggle.bind(this);
        this.destroy = this.destroy.bind(this);

        // Инициализация
        this.init();
    }

    init() {
        if (this.isInitialized) return this;

        if (!this.header) {
            console.warn("Header not found");
            return this;
        }

        this._bindEvents();

        // Начальная проверка
        this.handleScroll();

        this.isInitialized = true;
        eventBus.emit("header:initialized", {});

        return this;
    }

    _bindEvents() {
        // Скролл
        window.addEventListener("scroll", this.handleScroll, { passive: true });
        window.addEventListener("resize", this.handleResize, { passive: true });

        // Кнопка закрытия
        if (this.closeBtn) {
            this.closeBtn.addEventListener("click", () => this.hide(true));
        }

        // ESC
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.isVisible) {
                this.hide(true);
            }
        });

        // Клик вне хедера
        document.addEventListener("click", (e) => {
            if (
                this.isVisible &&
                this.header &&
                !this.header.contains(e.target) &&
                !this.closeBtn?.contains(e.target)
            ) {
                this.hide();
            }
        });

        // Mouse leave для показа при наведении на верх
        document.addEventListener("mouseleave", (e) => {
            if (e.clientY < 0 && window.scrollY > this.config.scrollThreshold) {
                this.show();
                this.isManuallyClosed = false;
            }
        });

        // Слушаем события от EventBus
        eventBus.on("app:destroy", () => {
            this.destroy();
        });
    }

    handleScroll() {
        const currentScrollY = window.scrollY;

        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            if (currentScrollY > this.config.scrollThreshold) {
                const isScrollingDown = currentScrollY > this.lastScrollY;

                if (isScrollingDown && !this.isManuallyClosed) {
                    this.hide();
                } else if (!isScrollingDown) {
                    this.show();
                }
            } else {
                this.hide();
            }

            this.lastScrollY = currentScrollY;
        }, this.config.debounceDelay);
    }

    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            if (
                window.scrollY > this.config.scrollThreshold &&
                !this.isManuallyClosed
            ) {
                this.show();
            } else {
                this.hide();
            }
        }, 250);
    }

    show() {
        if (!this.header || this.isVisible || this.isManuallyClosed) return;

        this.isVisible = true;
        this.header.classList.remove("is-hidden");
        this.header.classList.add("is-visible");
        this.header.setAttribute("aria-hidden", "false");

        eventBus.emit("header:shown", {});
    }

    hide(manually = false) {
        if (!this.header || !this.isVisible) return;

        this.isVisible = false;

        if (manually) {
            this.isManuallyClosed = true;
        }

        this.header.classList.remove("is-visible");
        this.header.classList.add("is-hidden");
        this.header.setAttribute("aria-hidden", "true");

        eventBus.emit("header:hidden", { manually });
    }

    toggle() {
        if (this.isVisible) {
            this.hide(true);
        } else {
            this.show();
            this.isManuallyClosed = false;
        }
    }

    getState() {
        return {
            isVisible: this.isVisible,
            isManuallyClosed: this.isManuallyClosed,
            isInitialized: this.isInitialized,
            scrollY: window.scrollY,
        };
    }

    destroy() {
        window.removeEventListener("scroll", this.handleScroll);
        window.removeEventListener("resize", this.handleResize);

        clearTimeout(this.scrollTimeout);
        clearTimeout(this.resizeTimeout);

        this.isInitialized = false;
        this.isVisible = false;

        eventBus.emit("header:destroyed", {});
    }
}
