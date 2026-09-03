/**
 * FormRetail — управление формой аренды зала
 * @class FormRetail
 */
export default class FormRetail {
    constructor(options = {}) {
        // Настройки
        this.config = {
            formSelector: "#formRetail",
            phoneSelector: 'input[name="phone"]',
            ageSelector: 'input[name="age"]',
            emailSelector: 'input[name="email"]',
            booksTableSelector: "#booksTableBody",
            addBookSelector: "#addBookBtn",
            bookCountSelector: "#bookCount",
            maxBooks: 10,
            ...options,
        };

        // DOM-элементы
        this.form = null;
        this.phoneInput = null;
        this.ageInput = null;
        this.emailInput = null;
        this.booksTableBody = null;
        this.addBookBtn = null;
        this.bookCountInput = null;

        // Состояния
        this.isInitialized = false;
        this.isSubmitting = false;

        // Привязка методов
        this.init = this.init.bind(this);
        this.destroy = this.destroy.bind(this);
        this.getState = this.getState.bind(this);
        this.validateForm = this.validateForm.bind(this);

        // Автоинициализация
        this.init();
    }

    /**
     * Инициализация формы
     * @returns {FormRetail} Экземпляр для цепочки вызовов
     */
    init() {
        if (this.isInitialized) {
            console.warn("FormRetail already initialized");
            return this;
        }

        // Проверяем наличие формы на странице
        this.form = document.querySelector(this.config.formSelector);

        if (!this.form) {
            console.log(
                "ℹ️ FormRetail: форма не найдена на странице, пропускаем",
            );
            return this;
        }

        console.log("✅ FormRetail: форма найдена, инициализация...");

        // Инициализация полей
        this._initFields();

        // Инициализация таблицы
        this._initBooksTable();

        // Инициализация валидации (убрали вызов несуществующего метода)
        // Валидация инициализируется через _bindEvents

        // Инициализация событий
        this._bindEvents();

        this.isInitialized = true;
        console.log("✅ FormRetail initialized");

        return this;
    }

    /**
     * Инициализация полей
     * @private
     */
    _initFields() {
        this.phoneInput = this.form.querySelector(this.config.phoneSelector);
        this.ageInput = this.form.querySelector(this.config.ageSelector);
        this.emailInput = this.form.querySelector(this.config.emailSelector);
        this.booksTableBody = this.form.querySelector(
            this.config.booksTableSelector,
        );
        this.addBookBtn = this.form.querySelector(this.config.addBookSelector);
        this.bookCountInput = this.form.querySelector(
            this.config.bookCountSelector,
        );
    }

    /**
     * Привязка событий
     * @private
     */
    _bindEvents() {
        // Маска телефона
        if (this.phoneInput) {
            this.phoneInput.addEventListener("input", (e) =>
                this._phoneMask(e.target),
            );
            this.phoneInput.addEventListener("focus", (e) =>
                this._phoneFocus(e.target),
            );
            this.phoneInput.addEventListener("blur", (e) =>
                this._phoneBlur(e.target),
            );
        }

        // Валидация возраста
        if (this.ageInput) {
            this.ageInput.addEventListener("input", (e) =>
                this._validateAge(e.target),
            );
            this.ageInput.addEventListener("blur", (e) =>
                this._validateAge(e.target),
            );
        }

        // Валидация email
        if (this.emailInput) {
            this.emailInput.addEventListener("input", (e) =>
                this._validateEmail(e.target),
            );
            this.emailInput.addEventListener("blur", (e) =>
                this._validateEmail(e.target),
            );
        }

        // Добавление строки в таблицу
        if (this.addBookBtn) {
            this.addBookBtn.addEventListener("click", (e) => {
                e.preventDefault();
                this._addBookRow();
            });
        }

        // Удаление строки из таблицы (делегирование)
        if (this.booksTableBody) {
            this.booksTableBody.addEventListener("click", (e) => {
                const removeBtn = e.target.closest(".books-table__remove-btn");
                if (removeBtn) {
                    e.preventDefault();
                    this._removeBookRow(removeBtn);
                }
            });
        }

        // Submit формы
        this.form.addEventListener("submit", (e) => this._handleSubmit(e));

        // Очистка ошибок при вводе
        this.form
            .querySelectorAll("input, textarea, select")
            .forEach((input) => {
                input.addEventListener("input", () => {
                    if (input.classList.contains("is-invalid")) {
                        input.classList.remove("is-invalid");
                        const field = input.closest(".field");
                        if (field) {
                            const errorSpan = field.querySelector(
                                "[data-formit-error]",
                            );
                            if (errorSpan) {
                                errorSpan.textContent = "";
                            }
                        }
                    }
                });
            });

        // Слушаем события FormIt
        document.addEventListener("formit:error", (e) =>
            this._handleFormitError(e),
        );
        document.addEventListener("formit:success", (e) =>
            this._handleFormitSuccess(e),
        );
        document.addEventListener("formit:beforeSubmit", (e) =>
            this._handleFormitBeforeSubmit(e),
        );
    }

    // ============================================
    // МАСКА ТЕЛЕФОНА
    // ============================================

    _phoneMask(input) {
        let phone = input.value.replace(/\D/g, "");
        if (phone.length > 0 && phone[0] === "8")
            phone = "7" + phone.substring(1);
        if (phone.length > 0 && phone[0] === "9") phone = "7" + phone;
        if (phone.length > 0 && phone[0] !== "7") phone = "7" + phone;

        let formatted = "";
        if (phone.length > 0) {
            formatted = "+7";
            if (phone.length > 1) {
                formatted += " (" + phone.substring(1, 4);
                if (phone.length > 4) {
                    formatted += ") " + phone.substring(4, 7);
                    if (phone.length > 7) {
                        formatted += "-" + phone.substring(7, 9);
                        if (phone.length > 9) {
                            formatted += "-" + phone.substring(9, 11);
                        }
                    }
                }
            }
        }
        input.value = formatted;
    }

    _phoneFocus(input) {
        if (!input.value) input.value = "+7 ";
    }

    _phoneBlur(input) {
        if (input.value.replace(/\D/g, "") === "7" || input.value === "") {
            input.value = "";
        }
    }

    // ============================================
    // МАСКА ДАТЫ
    // ============================================

    _dateMask(input) {
        let value = input.value.replace(/\D/g, "");
        if (value.length > 8) value = value.substring(0, 8);

        let formatted = "";
        for (let i = 0; i < value.length; i++) {
            if (i === 2 || i === 4) {
                formatted += ".";
            }
            formatted += value[i];
        }
        input.value = formatted;
    }

    _validateDate(input) {
        const value = input.value.trim();
        input.classList.remove("is-valid", "is-invalid");

        if (!value) return true;

        const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
        const match = value.match(dateRegex);

        if (!match) {
            input.classList.add("is-invalid");
            return false;
        }

        const day = parseInt(match[1]);
        const month = parseInt(match[2]);
        const year = parseInt(match[3]);

        const dateObj = new Date(year, month - 1, day);

        if (
            dateObj.getFullYear() !== year ||
            dateObj.getMonth() !== month - 1 ||
            dateObj.getDate() !== day
        ) {
            input.classList.add("is-invalid");
            return false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dateObj > today) {
            input.classList.add("is-invalid");
            return false;
        }

        if (year < 1900) {
            input.classList.add("is-invalid");
            return false;
        }

        input.classList.add("is-valid");
        return true;
    }

    _initDateFields(container) {
        const dateInputs = container.querySelectorAll(
            'input[name="book_year[]"]',
        );
        dateInputs.forEach((input) => {
            input.addEventListener("input", () => {
                const cursorPosition = input.selectionStart;
                this._dateMask(input);
                if (cursorPosition) {
                    let newPosition = cursorPosition;
                    if (cursorPosition > 2 && cursorPosition <= 3)
                        newPosition = cursorPosition + 1;
                    if (cursorPosition > 5 && cursorPosition <= 6)
                        newPosition = cursorPosition + 1;
                    if (newPosition > input.value.length)
                        newPosition = input.value.length;
                    input.setSelectionRange(newPosition, newPosition);
                }
            });

            input.addEventListener("blur", () => this._validateDate(input));
            input.addEventListener("focus", () =>
                input.classList.remove("is-valid", "is-invalid"),
            );

            input.addEventListener("keydown", (e) => {
                const allowedKeys = [
                    "Backspace",
                    "Delete",
                    "Tab",
                    "Escape",
                    "Enter",
                    "ArrowLeft",
                    "ArrowRight",
                    "ArrowUp",
                    "ArrowDown",
                    "Home",
                    "End",
                    ".",
                ];
                if (allowedKeys.includes(e.key)) return;
                if (e.ctrlKey || e.metaKey) {
                    if (["a", "c", "v", "x"].includes(e.key.toLowerCase()))
                        return;
                }
                if (!/^\d$/.test(e.key)) {
                    e.preventDefault();
                }
            });

            input.addEventListener("paste", () => {
                setTimeout(() => {
                    this._dateMask(input);
                    this._validateDate(input);
                }, 10);
            });
        });
    }

    // ============================================
    // ВАЛИДАЦИЯ
    // ============================================

    _validateAge(input) {
        const value = input.value.trim();
        const field = input.closest(".field");
        const errorSpan = field
            ? field.querySelector('[data-formit-error="age"]')
            : null;

        input.classList.remove("is-valid", "is-invalid");

        if (!value) {
            input.classList.add("is-invalid");
            if (errorSpan) errorSpan.textContent = "Введите возраст";
            return false;
        }

        const val = parseInt(value);
        if (isNaN(val) || val < 1 || val > 150) {
            input.classList.add("is-invalid");
            if (errorSpan) {
                if (val < 1) {
                    errorSpan.textContent = "Возраст должен быть больше 0";
                } else if (val > 150) {
                    errorSpan.textContent = "Возраст не может быть больше 150";
                } else {
                    errorSpan.textContent = "Введите корректный возраст";
                }
            }
            return false;
        }

        input.classList.add("is-valid");
        if (errorSpan) errorSpan.textContent = "";
        return true;
    }

    _validateEmail(input) {
        const value = input.value.trim();
        const field = input.closest(".field");
        const errorSpan = field
            ? field.querySelector('[data-formit-error="email"]')
            : null;

        input.classList.remove("is-valid", "is-invalid");

        if (!value) {
            if (errorSpan) errorSpan.textContent = "Введите email";
            input.classList.add("is-invalid");
            return false;
        }

        const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(value)) {
            let errorMessage = "Введите корректный email";
            if (!value.includes("@")) {
                errorMessage = "Email должен содержать символ @";
            } else if (!value.includes(".")) {
                errorMessage = "Email должен содержать точку после @";
            } else if (value.indexOf("@") === 0) {
                errorMessage = "Введите имя пользователя перед @";
            } else if (value.lastIndexOf(".") < value.indexOf("@")) {
                errorMessage = "Введите домен после @ (например, .com, .ru)";
            } else if (value.length < 5) {
                errorMessage = "Email слишком короткий";
            }

            if (errorSpan) errorSpan.textContent = errorMessage;
            input.classList.add("is-invalid");
            return false;
        }

        if (errorSpan) errorSpan.textContent = "";
        input.classList.add("is-valid");
        return true;
    }

    _validateBookField(input) {
        const fieldName = input.name;
        const errorSpan = input
            .closest(".books-table__col")
            .querySelector(".field__error");

        if (!input.value.trim()) {
            input.classList.add("is-invalid");
            if (errorSpan) {
                if (fieldName === "book_author[]") {
                    errorSpan.textContent = "Введите название зала";
                } else if (fieldName === "book_title[]") {
                    errorSpan.textContent = "Введите мероприятие";
                }
            }
            return false;
        }

        input.classList.remove("is-invalid");
        if (errorSpan) errorSpan.textContent = "";
        return true;
    }

    // ============================================
    // ТАБЛИЦА МЕРОПРИЯТИЙ
    // ============================================

    _initBooksTable() {
        if (!this.booksTableBody) return;

        // Инициализация существующих полей
        this.booksTableBody
            .querySelectorAll(
                'input[name="book_author[]"], input[name="book_title[]"]',
            )
            .forEach((input) => {
                input.addEventListener("blur", () =>
                    this._validateBookField(input),
                );
                input.addEventListener("input", () => {
                    if (input.value.trim()) {
                        input.classList.remove("is-invalid");
                        const errorSpan = input
                            .closest(".books-table__col")
                            .querySelector(".field__error");
                        if (errorSpan) errorSpan.textContent = "";
                    }
                });
            });

        // Инициализация маски даты
        this._initDateFields(this.booksTableBody);

        // Обновление состояния
        this._updateBookCount();
        this._updateRemoveButtons();
    }

    _addBookRow() {
        const rows = this.booksTableBody.querySelectorAll(".books-table__row");
        const currentCount = rows.length;

        if (currentCount >= this.config.maxBooks) {
            alert("Максимальное количество залов: " + this.config.maxBooks);
            return;
        }

        const newIndex = currentCount;
        const row = document.createElement("div");
        row.className = "books-table__row books-table__row--adding";
        row.dataset.rowIndex = newIndex;

        row.innerHTML = `
            <span class="books-table__col books-table__col--number">${newIndex + 1}</span>
            <div class="books-table__col books-table__col--author">
                <input type="text" name="book_author[]" class="books-table__input" placeholder="Название зала" data-error="book_author_${newIndex}">
                <span class="field__error" data-formit-error="book_author_${newIndex}"></span>
            </div>
            <div class="books-table__col books-table__col--title">
                <input type="text" name="book_title[]" class="books-table__input" placeholder="Мероприятие" data-error="book_title_${newIndex}">
                <span class="field__error" data-formit-error="book_title_${newIndex}"></span>
            </div>
            <div class="books-table__col books-table__col--year">
                <input type="text" name="book_year[]" class="books-table__input" placeholder="ДД.ММ.ГГГГ">
            </div>
            <div class="books-table__col books-table__col--actions">
                <button type="button" class="books-table__remove-btn" data-row-index="${newIndex}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;

        this.booksTableBody.appendChild(row);

        // Инициализация новых полей
        const newAuthorInput = row.querySelector('input[name="book_author[]"]');
        const newTitleInput = row.querySelector('input[name="book_title[]"]');
        const newYearInput = row.querySelector('input[name="book_year[]"]');

        if (newAuthorInput) {
            newAuthorInput.addEventListener("blur", () =>
                this._validateBookField(newAuthorInput),
            );
            newAuthorInput.addEventListener("input", () => {
                if (newAuthorInput.value.trim()) {
                    newAuthorInput.classList.remove("is-invalid");
                    const errorSpan = newAuthorInput
                        .closest(".books-table__col")
                        .querySelector(".field__error");
                    if (errorSpan) errorSpan.textContent = "";
                }
            });
        }

        if (newTitleInput) {
            newTitleInput.addEventListener("blur", () =>
                this._validateBookField(newTitleInput),
            );
            newTitleInput.addEventListener("input", () => {
                if (newTitleInput.value.trim()) {
                    newTitleInput.classList.remove("is-invalid");
                    const errorSpan = newTitleInput
                        .closest(".books-table__col")
                        .querySelector(".field__error");
                    if (errorSpan) errorSpan.textContent = "";
                }
            });
        }

        if (newYearInput) {
            this._initDateFields(row);
        }

        this._updateRowNumbers();
        this._updateRemoveButtons();
        this._updateBookCount();

        setTimeout(() => row.classList.remove("books-table__row--adding"), 300);
    }

    _removeBookRow(button) {
        const row = button.closest(".books-table__row");
        const rows = this.booksTableBody.querySelectorAll(".books-table__row");

        if (rows.length <= 1) return;

        row.classList.add("books-table__row--removing");

        setTimeout(() => {
            row.remove();
            this._updateRowNumbers();
            this._updateRemoveButtons();
            this._updateBookCount();
        }, 300);
    }

    _updateRowNumbers() {
        const rows = this.booksTableBody.querySelectorAll(".books-table__row");
        rows.forEach((row, index) => {
            const numberCol = row.querySelector(".books-table__col--number");
            if (numberCol) {
                numberCol.textContent = index + 1;
            }
            row.dataset.rowIndex = index;
        });
    }

    _updateRemoveButtons() {
        const rows = this.booksTableBody.querySelectorAll(".books-table__row");
        const removeBtns = this.booksTableBody.querySelectorAll(
            ".books-table__remove-btn",
        );

        removeBtns.forEach((btn) => {
            btn.style.display = rows.length <= 1 ? "none" : "flex";
        });
    }

    _updateBookCount() {
        const rows = this.booksTableBody.querySelectorAll(".books-table__row");
        const count = rows.length;

        if (this.bookCountInput) {
            this.bookCountInput.value = count;
        }

        if (this.addBookBtn) {
            this.addBookBtn.disabled = count >= this.config.maxBooks;
        }
    }

    // ============================================
    // ВАЛИДАЦИЯ ПЕРЕД ОТПРАВКОЙ
    // ============================================

    validateForm() {
        let hasErrors = false;
        let firstErrorField = null;

        // Проверка имени
        const nameInput = this.form.querySelector('input[name="name"]');
        if (nameInput && !nameInput.value.trim()) {
            nameInput.classList.add("is-invalid");
            const errorSpan = nameInput
                .closest(".field")
                .querySelector('[data-formit-error="name"]');
            if (errorSpan) errorSpan.textContent = "Введите ФИО";
            hasErrors = true;
            if (!firstErrorField) firstErrorField = nameInput;
        }

        // Проверка возраста
        if (this.ageInput) {
            const value = this.ageInput.value.trim();
            const field = this.ageInput.closest(".field");
            const errorSpan = field
                ? field.querySelector('[data-formit-error="age"]')
                : null;

            if (!value) {
                this.ageInput.classList.add("is-invalid");
                if (errorSpan) errorSpan.textContent = "Введите возраст";
                hasErrors = true;
                if (!firstErrorField) firstErrorField = this.ageInput;
            } else {
                const val = parseInt(value);
                if (isNaN(val) || val < 1 || val > 150) {
                    this.ageInput.classList.add("is-invalid");
                    if (errorSpan) {
                        if (val < 1) {
                            errorSpan.textContent =
                                "Возраст должен быть больше 0";
                        } else if (val > 150) {
                            errorSpan.textContent =
                                "Возраст не может быть больше 150";
                        } else {
                            errorSpan.textContent =
                                "Введите корректный возраст";
                        }
                    }
                    hasErrors = true;
                    if (!firstErrorField) firstErrorField = this.ageInput;
                }
            }
        }

        // Проверка телефона
        if (this.phoneInput) {
            const phoneClean = this.phoneInput.value.replace(/\D/g, "");
            if (phoneClean.length < 11) {
                this.phoneInput.classList.add("is-invalid");
                const errorSpan = this.phoneInput
                    .closest(".field")
                    .querySelector('[data-formit-error="phone"]');
                if (errorSpan)
                    errorSpan.textContent = "Введите корректный номер телефона";
                hasErrors = true;
                if (!firstErrorField) firstErrorField = this.phoneInput;
            }
        }

        // Проверка email
        if (this.emailInput && !this._validateEmail(this.emailInput)) {
            hasErrors = true;
            if (!firstErrorField) firstErrorField = this.emailInput;
        }

        // Проверка таблицы мероприятий
        if (this.booksTableBody) {
            const rows =
                this.booksTableBody.querySelectorAll(".books-table__row");
            rows.forEach((row) => {
                const authorInput = row.querySelector(
                    'input[name="book_author[]"]',
                );
                const titleInput = row.querySelector(
                    'input[name="book_title[]"]',
                );

                if (authorInput && !authorInput.value.trim()) {
                    authorInput.classList.add("is-invalid");
                    const errorSpan = authorInput
                        .closest(".books-table__col")
                        .querySelector(".field__error");
                    if (errorSpan)
                        errorSpan.textContent = "Введите название зала";
                    hasErrors = true;
                    if (!firstErrorField) firstErrorField = authorInput;
                }

                if (titleInput && !titleInput.value.trim()) {
                    titleInput.classList.add("is-invalid");
                    const errorSpan = titleInput
                        .closest(".books-table__col")
                        .querySelector(".field__error");
                    if (errorSpan)
                        errorSpan.textContent = "Введите мероприятие";
                    hasErrors = true;
                    if (!firstErrorField) firstErrorField = titleInput;
                }
            });
        }

        return { hasErrors, firstErrorField };
    }

    // ============================================
    // ОБРАБОТКА СОБЫТИЙ
    // ============================================

    _handleSubmit(e) {
        const result = this.validateForm();

        if (result.hasErrors) {
            e.preventDefault();

            if (result.firstErrorField) {
                setTimeout(() => {
                    const headerOffset = 100;
                    const elementPosition =
                        result.firstErrorField.getBoundingClientRect().top;
                    const offsetPosition =
                        elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                    });
                    result.firstErrorField.focus();
                    result.firstErrorField.classList.add("highlight-error");
                    setTimeout(
                        () =>
                            result.firstErrorField.classList.remove(
                                "highlight-error",
                            ),
                        2000,
                    );
                }, 100);
            }
        }
    }

    _handleFormitError(e) {
        this._resetSubmitButton();

        const errorSpans = this.form.querySelectorAll("[data-formit-error]");
        errorSpans.forEach((span) => {
            if (span.textContent.trim()) {
                const field = span.closest(".field");
                if (field) {
                    const input = field.querySelector(
                        "input, textarea, select",
                    );
                    if (input) input.classList.add("is-invalid");
                    field.classList.add("has-error");
                }
            }
        });

        setTimeout(() => {
            const errorSpansInForm = this.form.querySelectorAll(
                "[data-formit-error]",
            );
            let firstInput = null;

            for (const span of errorSpansInForm) {
                if (span.textContent.trim()) {
                    const field = span.closest(".field");
                    if (field) {
                        firstInput = field.querySelector(
                            "input, textarea, select",
                        );
                        break;
                    }
                }
            }

            if (firstInput) {
                const headerOffset = 100;
                const elementPosition = firstInput.getBoundingClientRect().top;
                const offsetPosition =
                    elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                });

                setTimeout(() => {
                    firstInput.focus();
                    firstInput.classList.add("highlight-error");
                    setTimeout(
                        () => firstInput.classList.remove("highlight-error"),
                        2000,
                    );
                }, 400);
            }
        }, 400);
    }

    _handleFormitSuccess(e) {
        this._resetSubmitButton();
    }

    _handleFormitBeforeSubmit(e) {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = "Отправка...";
        }
        this.isSubmitting = true;
    }

    _resetSubmitButton() {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Отправить заявку";
        }
        this.isSubmitting = false;
    }

    // ============================================
    // PUBLIC METHODS
    // ============================================

    /**
     * Получить состояние формы
     * @returns {Object} Состояние
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            isSubmitting: this.isSubmitting,
            hasForm: !!this.form,
            formId: this.form?.id || null,
            fields: {
                phone: !!this.phoneInput,
                age: !!this.ageInput,
                email: !!this.emailInput,
                booksTable: !!this.booksTableBody,
            },
        };
    }

    /**
     * Дестрой формы
     */
    destroy() {
        if (!this.isInitialized) return;

        // Очистка событий (в нативном JS нужно удалять вручную)
        // Для простоты используем делегирование

        this.isInitialized = false;
        console.log("🔄 FormRetail destroyed");
    }
}
