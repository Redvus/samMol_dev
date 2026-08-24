/**
 * InfiniteSlider — бесконечный слайдер с анимациями
 * @class InfiniteSlider
 */
export default class InfiniteSlider {
    constructor(element, options = {}) {
        this.container =
            typeof element === "string"
                ? document.querySelector(element)
                : element;

        if (!this.container) {
            console.warn("❌ Slider container not found");
            return;
        }

        const slidesDataAttr = this.container.dataset.slides;
        let slidesData = [];

        try {
            slidesData = slidesDataAttr ? JSON.parse(slidesDataAttr) : [];
        } catch (e) {
            console.warn("❌ Invalid JSON in data-slides", e);
            slidesData = [];
        }

        if (!slidesData || slidesData.length === 0) {
            console.log("ℹ️ Slider: нет слайдов для отображения");
            this.container.innerHTML =
                '<div class="slider-empty">Нет слайдов</div>';
            return;
        }

        const animationConfig = {
            title:
                this.container.dataset.animTitle ||
                options.animTitle ||
                "fadeInUp",
            text:
                this.container.dataset.animText ||
                options.animText ||
                "fadeInUp",
            button:
                this.container.dataset.animButton ||
                options.animButton ||
                "fadeInUp",
            delayTitle:
                parseInt(this.container.dataset.delayTitle) ||
                options.delayTitle ||
                200,
            delayText:
                parseInt(this.container.dataset.delayText) ||
                options.delayText ||
                400,
            delayButton:
                parseInt(this.container.dataset.delayButton) ||
                options.delayButton ||
                600,
            duration:
                parseInt(this.container.dataset.animDuration) ||
                options.animDuration ||
                600,
        };

        const fieldMapping = {
            image:
                this.container.dataset.fieldImage || options.fieldImage || null,
            title:
                this.container.dataset.fieldTitle || options.fieldTitle || null,
            text: this.container.dataset.fieldText || options.fieldText || null,
            link: this.container.dataset.fieldLink || options.fieldLink || null,
            button:
                this.container.dataset.fieldButton ||
                options.fieldButton ||
                null,
        };

        let autoplay = true;
        if (this.container.dataset.autoplay !== undefined) {
            autoplay = this.container.dataset.autoplay === "true";
        } else if (options.autoplay !== undefined) {
            autoplay = options.autoplay;
        }

        this.options = {
            slides: slidesData,
            autoplay: autoplay,
            autoplayDelay:
                parseInt(this.container.dataset.autoplayDelay) ||
                options.autoplayDelay ||
                4000,
            transitionDuration:
                parseInt(this.container.dataset.transitionDuration) ||
                options.transitionDuration ||
                500,
            fieldMapping: fieldMapping,
            animation: animationConfig,
        };

        console.log(`🎯 Autoplay: ${this.options.autoplay ? "ON" : "OFF"}`);

        this.fieldMapping = this.detectFields(
            this.options.slides,
            this.options.fieldMapping,
        );

        this.slidesData = this.options.slides;
        this.totalSlides = this.slidesData.length;

        this.track = this.container.querySelector(".slider-track");
        this.dotsContainer = this.container.querySelector(".dots-container");
        this.prevBtn = this.container.querySelector(".slider-prev");
        this.nextBtn = this.container.querySelector(".slider-next");

        if (!this.track) {
            console.warn("❌ Slider track (.slider-track) not found");
            this.container.innerHTML =
                '<div class="slider-error">Ошибка: не найден .slider-track</div>';
            return;
        }

        this.currentIndex = 1;
        this.realIndex = 0;
        this.isAnimating = false;
        this.autoplayTimer = null;
        this.slides = [];
        this.dots = [];
        this.isInitialized = false;
        this.animationTimeout = null;

        console.log(`✅ Slider: найдено ${this.totalSlides} слайдов`);
        this.init();
    }

    detectFields(slides, explicitMapping = {}) {
        if (!slides || slides.length === 0) {
            return {
                image: explicitMapping.image || "image",
                title: explicitMapping.title || "title",
                text: explicitMapping.text || null,
                link: explicitMapping.link || null,
                button: explicitMapping.button || null,
            };
        }

        if (explicitMapping.image && explicitMapping.title) {
            return {
                image: explicitMapping.image,
                title: explicitMapping.title,
                text: explicitMapping.text || null,
                link: explicitMapping.link || null,
                button: explicitMapping.button || null,
            };
        }

        const sample = slides[0];
        const keys = Object.keys(sample);

        const imagePatterns = [
            "image",
            "img",
            "picture",
            "photo",
            "imageSlide",
            "slideImage",
            "file",
            "url",
            "src",
            "path",
            "slide_image",
        ];
        const titlePatterns = [
            "title",
            "heading",
            "header",
            "name",
            "imageTitle",
            "slideTitle",
            "label",
            "caption",
            "slide_title",
        ];
        const textPatterns = [
            "text",
            "description",
            "desc",
            "content",
            "body",
            "imageText",
            "slideText",
            "excerpt",
            "summary",
            "slide_description",
        ];
        const linkPatterns = ["link", "url", "href", "link_url", "slide_link"];
        const buttonPatterns = ["button", "btn", "button_text", "slide_button"];

        const findField = (patterns, exclude = []) => {
            for (const pattern of patterns) {
                if (keys.includes(pattern) && !exclude.includes(pattern)) {
                    return pattern;
                }
            }
            for (const key of keys) {
                if (exclude.includes(key)) continue;
                const keyLower = key.toLowerCase();
                for (const pattern of patterns) {
                    if (
                        keyLower.includes(pattern.toLowerCase()) ||
                        pattern.toLowerCase().includes(keyLower)
                    ) {
                        return key;
                    }
                }
            }
            return null;
        };

        const imageField =
            explicitMapping.image || findField(imagePatterns) || keys[0];
        const usedFields = [imageField];

        const titleField =
            explicitMapping.title ||
            findField(titlePatterns, usedFields) ||
            null;
        if (titleField) usedFields.push(titleField);

        const textField =
            explicitMapping.text || findField(textPatterns, usedFields) || null;
        if (textField) usedFields.push(textField);

        const linkField =
            explicitMapping.link || findField(linkPatterns, usedFields) || null;
        if (linkField) usedFields.push(linkField);

        const buttonField =
            explicitMapping.button ||
            findField(buttonPatterns, usedFields) ||
            null;

        return {
            image: imageField,
            title: titleField || null,
            text: textField || null,
            link: linkField || null,
            button: buttonField || null,
        };
    }

    getValue(obj, path) {
        if (!path) return "";
        const keys = path.split(".");
        let value = obj;
        for (const key of keys) {
            if (value && typeof value === "object" && key in value) {
                value = value[key];
            } else {
                return "";
            }
        }
        return value || "";
    }

    init() {
        if (this.isInitialized) return this;
        if (!this.track) return this;

        this.buildSlider();
        this.setupControls();
        this.setupKeyboard();
        this.setupResize();
        this.updatePosition(false);

        // Запускаем анимацию для первого слайда
        setTimeout(() => {
            this.animateCurrentSlide();
        }, 100);

        if (this.options.autoplay) {
            this.startAutoplay();
        }

        this.container.addEventListener("mouseenter", () => {
            if (this.options.autoplay) {
                this.stopAutoplay();
            }
        });

        this.container.addEventListener("mouseleave", () => {
            if (this.options.autoplay) {
                this.startAutoplay();
            }
        });

        this.isInitialized = true;
        console.log("✅ InfiniteSlider initialized");

        return this;
    }

    buildSlider() {
        if (!this.track) return;

        this.track.innerHTML = "";

        const lastClone = this.createSlide(
            this.slidesData[this.totalSlides - 1],
            "clone",
        );
        this.track.appendChild(lastClone);

        this.slidesData.forEach((data, i) => {
            const slide = this.createSlide(data, "real", i);
            this.track.appendChild(slide);
        });

        const firstClone = this.createSlide(this.slidesData[0], "clone");
        this.track.appendChild(firstClone);

        this.slides = Array.from(this.track.querySelectorAll(".slide"));

        if (this.dotsContainer) {
            this.dotsContainer.innerHTML = "";
            this.slidesData.forEach((_, i) => {
                const dot = document.createElement("button");
                dot.className = "dot" + (i === 0 ? " active" : "");
                dot.setAttribute("data-index", i);
                dot.setAttribute("aria-label", `Слайд ${i + 1}`);
                this.dotsContainer.appendChild(dot);
            });
            this.dots = Array.from(this.dotsContainer.querySelectorAll(".dot"));
        }
    }

    createSlide(data, type, idx) {
        const slide = document.createElement("div");
        slide.className = "slide";
        if (type === "real" && idx === 0) slide.classList.add("active");

        const image = this.getValue(data, this.fieldMapping.image) || "";
        const title = this.getValue(data, this.fieldMapping.title) || "";
        const text = this.getValue(data, this.fieldMapping.text) || "";
        const link = this.getValue(data, this.fieldMapping.link) || "";
        const button = this.getValue(data, this.fieldMapping.button) || "";

        let finalTitle = title;
        if (!finalTitle) {
            for (const [key, value] of Object.entries(data)) {
                if (
                    typeof value === "string" &&
                    value.length > 0 &&
                    key !== this.fieldMapping.image
                ) {
                    finalTitle = value;
                    break;
                }
            }
        }

        let finalText = text;
        if (!finalText) {
            for (const [key, value] of Object.entries(data)) {
                if (
                    typeof value === "string" &&
                    value.length > 0 &&
                    key !== this.fieldMapping.image &&
                    key !== this.fieldMapping.title &&
                    key !== finalTitle
                ) {
                    finalText = value;
                    break;
                }
            }
        }

        const safeTitle = String(finalTitle || "")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        const safeText = String(finalText || "")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        const safeButton = String(button || "")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        const anim = this.options.animation;
        const animClassTitle = anim.title || "fadeInUp";
        const animClassText = anim.text || "fadeInUp";
        const animClassButton = anim.button || "fadeInUp";
        const delayTitle = anim.delayTitle || 200;
        const delayText = anim.delayText || 400;
        const delayButton = anim.delayButton || 600;
        const duration = anim.duration || 600;

        // 🔥 Все анимируемые элементы изначально скрыты (opacity: 0)
        let contentHTML = `
            <div class="slide-image">
                <img src="${image}" alt="${safeTitle}" loading="lazy" />
            </div>
            <div class="slide-content">
        `;

        if (safeTitle) {
            contentHTML += `
                <h2 class="slide-title animatable ${animClassTitle}"
                    data-animation="${animClassTitle}"
                    style="opacity: 0; animation-delay: ${delayTitle}ms; animation-duration: ${duration}ms;">
                    ${safeTitle}
                </h2>
            `;
        }

        if (safeText) {
            contentHTML += `
                <p class="slide-text animatable ${animClassText}"
                   data-animation="${animClassText}"
                   style="opacity: 0; animation-delay: ${delayText}ms; animation-duration: ${duration}ms;">
                    ${safeText}
                </p>
            `;
        }

        if (link && safeButton) {
            contentHTML += `
                <a href="${link}" class="slide-button animatable ${animClassButton}"
                   data-animation="${animClassButton}"
                   style="opacity: 0; animation-delay: ${delayButton}ms; animation-duration: ${duration}ms;">
                    ${safeButton}
                </a>
            `;
        } else if (safeButton && !link) {
            contentHTML += `
                <span class="slide-button animatable ${animClassButton}"
                      data-animation="${animClassButton}"
                      style="opacity: 0; animation-delay: ${delayButton}ms; animation-duration: ${duration}ms;">
                    ${safeButton}
                </span>
            `;
        }

        contentHTML += `</div>`;

        slide.innerHTML = contentHTML;
        return slide;
    }

    /**
     * 🔥 Анимация текущего слайда — перезапускается при каждом переключении
     */
    animateCurrentSlide() {
        // Очищаем предыдущий таймаут
        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
            this.animationTimeout = null;
        }

        // Находим текущий активный слайд
        let currentSlide = null;

        // Ищем слайд с классом active среди реальных слайдов
        for (let i = 1; i <= this.totalSlides; i++) {
            const slide = this.slides[i];
            if (slide && slide.classList.contains("active")) {
                currentSlide = slide;
                break;
            }
        }

        // Если не нашли по active, берем по индексу
        if (!currentSlide) {
            currentSlide = this.slides[this.currentIndex];
        }

        if (!currentSlide) return;

        // Получаем все анимируемые элементы в слайде
        const animatables = currentSlide.querySelectorAll(".animatable");

        if (animatables.length === 0) return;

        // 🔥 Сбрасываем все анимации с принудительным перерасчетом
        animatables.forEach((el, index) => {
            // Полностью сбрасываем стили
            el.style.animation = "none";
            el.style.opacity = "0";
            el.classList.remove("animated");

            // Принудительно перерисовываем элемент
            void el.offsetHeight;

            // Получаем задержку из атрибута или вычисляем
            let delay = parseInt(el.style.animationDelay) || 200 + index * 200;

            // Запускаем анимацию с задержкой
            this.animationTimeout = setTimeout(() => {
                // Возвращаем анимацию
                el.style.animation = "";
                el.style.opacity = "1";
                el.classList.add("animated");
            }, 50 + delay);
        });
    }

    setupControls() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener("click", (e) => {
                e.preventDefault();
                this.prev();
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener("click", (e) => {
                e.preventDefault();
                this.next();
            });
        }

        if (this.dotsContainer) {
            this.dotsContainer.addEventListener("click", (e) => {
                const dot = e.target.closest(".dot");
                if (dot) {
                    const idx = parseInt(dot.getAttribute("data-index"), 10);
                    if (!isNaN(idx) && idx !== this.realIndex) {
                        this.goTo(idx);
                    }
                }
            });
        }

        this.setupSwipe();
    }

    setupSwipe() {
        let startX = 0;
        let startY = 0;
        let isSwiping = false;

        this.container.addEventListener(
            "touchstart",
            (e) => {
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
                isSwiping = true;
            },
            { passive: true },
        );

        this.container.addEventListener(
            "touchmove",
            (e) => {
                if (!isSwiping) return;
                const touch = e.touches[0];
                const diffX = startX - touch.clientX;
                const diffY = startY - touch.clientY;

                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                    e.preventDefault();
                    if (diffX > 0) {
                        this.next();
                    } else {
                        this.prev();
                    }
                    isSwiping = false;
                }
            },
            { passive: false },
        );

        this.container.addEventListener(
            "touchend",
            () => {
                isSwiping = false;
            },
            { passive: true },
        );
    }

    setupKeyboard() {
        document.addEventListener("keydown", (e) => {
            if (this.container.contains(document.activeElement)) {
                if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    this.prev();
                } else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    this.next();
                }
            }
        });
    }

    setupResize() {
        const debounce = (fn, delay) => {
            let timer;
            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(() => fn.apply(this, args), delay);
            };
        };

        window.addEventListener(
            "resize",
            debounce(() => {
                if (this.totalSlides === 0 || !this.track) return;
                const wasAnimating = this.isAnimating;
                if (wasAnimating) this.isAnimating = false;

                this.track.style.transition = "none";
                const width = this.container.clientWidth;
                this.track.style.transform = `translateX(${-this.currentIndex * width}px)`;
                void this.track.offsetHeight;
                this.track.style.transition = `transform ${this.options.transitionDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;

                if (wasAnimating) {
                    setTimeout(() => {
                        this.isAnimating = false;
                    }, 100);
                }
            }, 150),
        );
    }

    updatePosition(animate = true) {
        if (this.totalSlides === 0 || !this.track) return;

        if (!animate) {
            this.track.style.transition = "none";
        } else {
            this.track.style.transition = `transform ${this.options.transitionDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        }

        const width = this.container.clientWidth;
        this.track.style.transform = `translateX(${-this.currentIndex * width}px)`;

        // Обновляем классы active у слайдов
        if (this.slides.length > 0) {
            this.slides.forEach((slide, i) => {
                const isReal = i >= 1 && i <= this.totalSlides;
                if (isReal) {
                    const realIdx = i - 1;
                    const isActive = realIdx === this.realIndex;
                    slide.classList.toggle("active", isActive);

                    // 🔥 Если слайд становится неактивным — скрываем анимации
                    if (!isActive) {
                        const animatables =
                            slide.querySelectorAll(".animatable");
                        animatables.forEach((el) => {
                            el.style.opacity = "0";
                            el.classList.remove("animated");
                            el.style.animation = "none";
                        });
                    }
                } else {
                    slide.classList.remove("active");
                }
            });
        }

        // Обновляем точки
        if (this.dots) {
            this.dots.forEach((dot, i) => {
                dot.classList.toggle("active", i === this.realIndex);
            });
        }

        if (!animate) {
            void this.track.offsetHeight;
            this.track.style.transition = `transform ${this.options.transitionDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        }

        // 🔥 Запускаем анимацию для нового активного слайда
        if (animate) {
            // Очищаем предыдущий таймаут анимации
            if (this.animationTimeout) {
                clearTimeout(this.animationTimeout);
                this.animationTimeout = null;
            }

            // Запускаем анимацию после завершения перехода
            this.animationTimeout = setTimeout(() => {
                this.animateCurrentSlide();
                this.animationTimeout = null;
            }, this.options.transitionDuration + 150);
        }
    }

    goTo(targetRealIndex, animate = true) {
        if (this.isAnimating || this.totalSlides === 0 || !this.track) return;

        let newReal = targetRealIndex;
        if (newReal < 0) newReal = this.totalSlides - 1;
        if (newReal >= this.totalSlides) newReal = 0;

        if (newReal === this.realIndex && animate) return;

        this.isAnimating = true;
        let newTrackIndex = newReal + 1;

        if (this.realIndex === this.totalSlides - 1 && newReal === 0) {
            const cloneIndex = this.totalSlides + 1;
            this.currentIndex = cloneIndex;
            this.realIndex = 0;
            this.updatePosition(true);

            const onFinish = () => {
                this.track.removeEventListener("transitionend", onFinish);
                this.track.style.transition = "none";
                this.currentIndex = 1;
                this.track.style.transform = `translateX(${-this.currentIndex * this.container.clientWidth}px)`;
                void this.track.offsetHeight;
                this.track.style.transition = `transform ${this.options.transitionDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
                this.isAnimating = false;
                this.updatePosition(false);
                this.animateCurrentSlide();
            };
            this.track.addEventListener("transitionend", onFinish);

            setTimeout(() => {
                if (this.isAnimating) {
                    this.track.removeEventListener("transitionend", onFinish);
                    this.isAnimating = false;
                    this.currentIndex = 1;
                    this.updatePosition(false);
                    this.animateCurrentSlide();
                }
            }, 600);
            return;
        }

        if (this.realIndex === 0 && newReal === this.totalSlides - 1) {
            this.currentIndex = 0;
            this.realIndex = this.totalSlides - 1;
            this.updatePosition(true);

            const onFinish = () => {
                this.track.removeEventListener("transitionend", onFinish);
                this.track.style.transition = "none";
                this.currentIndex = this.totalSlides;
                this.track.style.transform = `translateX(${-this.currentIndex * this.container.clientWidth}px)`;
                void this.track.offsetHeight;
                this.track.style.transition = `transform ${this.options.transitionDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
                this.isAnimating = false;
                this.updatePosition(false);
                this.animateCurrentSlide();
            };
            this.track.addEventListener("transitionend", onFinish);

            setTimeout(() => {
                if (this.isAnimating) {
                    this.track.removeEventListener("transitionend", onFinish);
                    this.isAnimating = false;
                    this.currentIndex = this.totalSlides;
                    this.updatePosition(false);
                    this.animateCurrentSlide();
                }
            }, 600);
            return;
        }

        this.currentIndex = newTrackIndex;
        this.realIndex = newReal;
        this.updatePosition(animate);

        const onFinish = () => {
            this.isAnimating = false;
            this.track.removeEventListener("transitionend", onFinish);
        };
        this.track.addEventListener("transitionend", onFinish);

        setTimeout(() => {
            if (this.isAnimating) {
                this.isAnimating = false;
                this.track.removeEventListener("transitionend", onFinish);
            }
        }, 600);
    }

    next() {
        this.goTo(this.realIndex + 1);
        if (this.options.autoplay) {
            this.resetAutoplay();
        }
    }

    prev() {
        this.goTo(this.realIndex - 1);
        if (this.options.autoplay) {
            this.resetAutoplay();
        }
    }

    startAutoplay() {
        if (!this.options.autoplay) {
            console.log("ℹ️ Autoplay disabled");
            return;
        }

        if (this.autoplayTimer) {
            this.stopAutoplay();
        }
        this.autoplayTimer = setInterval(() => {
            this.next();
        }, this.options.autoplayDelay);
        console.log(
            `▶️ Autoplay started (delay: ${this.options.autoplayDelay}ms)`,
        );
    }

    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
            console.log("⏹️ Autoplay stopped");
        }
    }

    resetAutoplay() {
        this.stopAutoplay();
        this.startAutoplay();
    }

    getState() {
        return {
            isInitialized: this.isInitialized,
            totalSlides: this.totalSlides,
            currentIndex: this.realIndex,
            isAnimating: this.isAnimating,
            isAutoplay: !!this.autoplayTimer,
            autoplayEnabled: this.options.autoplay,
        };
    }

    destroy() {
        if (!this.isInitialized) return;
        this.stopAutoplay();

        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
            this.animationTimeout = null;
        }

        this.isInitialized = false;
        console.log("🔄 InfiniteSlider destroyed");
    }
}
