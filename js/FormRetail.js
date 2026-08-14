// assets/js/payment-form.js

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("formRetail");
    if (!form) return;

    console.log("✅ Форма аренды зала инициализирована");

    // ============================================
    // 1. МАСКА ТЕЛЕФОНА
    // ============================================

    function phoneMask(input) {
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

    const phoneInput = form.querySelector('input[name="phone"]');
    if (phoneInput) {
        phoneInput.addEventListener("input", function () {
            phoneMask(this);
        });
        phoneInput.addEventListener("focus", function () {
            if (!this.value) this.value = "+7 ";
        });
        phoneInput.addEventListener("blur", function () {
            if (this.value.replace(/\D/g, "") === "7" || this.value === "") {
                this.value = "";
            }
        });
    }

    // ============================================
    // 2. МАСКА ДАТЫ
    // ============================================

    function dateMask(input) {
        // Удаляем все нецифровые символы
        let value = input.value.replace(/\D/g, "");

        // Ограничиваем длину (8 цифр для ДД.ММ.ГГГГ)
        if (value.length > 8) value = value.substring(0, 8);

        // Форматируем с разделителями
        let formatted = "";
        for (let i = 0; i < value.length; i++) {
            if (i === 2 || i === 4) {
                formatted += ".";
            }
            formatted += value[i];
        }

        input.value = formatted;
    }

    // Функция валидации даты
    function validateDate(input) {
        const value = input.value.trim();
        input.classList.remove("is-valid", "is-invalid");

        // Если поле пустое - не показываем ошибку (можно оставить необязательным)
        if (!value) {
            return true;
        }

        // Проверяем формат ДД.ММ.ГГГГ
        const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
        const match = value.match(dateRegex);

        if (!match) {
            input.classList.add("is-invalid");
            return false;
        }

        const day = parseInt(match[1]);
        const month = parseInt(match[2]);
        const year = parseInt(match[3]);

        // Проверяем корректность даты
        const dateObj = new Date(year, month - 1, day);

        // Проверяем, что дата существует и соответствует введенным значениям
        if (
            dateObj.getFullYear() !== year ||
            dateObj.getMonth() !== month - 1 ||
            dateObj.getDate() !== day
        ) {
            input.classList.add("is-invalid");
            return false;
        }

        // Проверяем, что дата не в будущем (опционально)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dateObj > today) {
            input.classList.add("is-invalid");
            return false;
        }

        // Проверяем минимальную дату (например, не раньше 1900 года)
        if (year < 1900) {
            input.classList.add("is-invalid");
            return false;
        }

        input.classList.add("is-valid");
        return true;
    }

    // Применяем маску и валидацию ко всем полям "Дата"
    function initDateFields(container) {
        const dateInputs = container.querySelectorAll(
            'input[name="book_year[]"]',
        );
        dateInputs.forEach(function (input) {
            // Маска при вводе
            input.addEventListener("input", function () {
                const cursorPosition = this.selectionStart;
                dateMask(this);

                // Восстанавливаем позицию курсора
                if (cursorPosition) {
                    let newPosition = cursorPosition;
                    // Корректируем позицию с учетом точек
                    if (cursorPosition > 2 && cursorPosition <= 3)
                        newPosition = cursorPosition + 1;
                    if (cursorPosition > 5 && cursorPosition <= 6)
                        newPosition = cursorPosition + 1;
                    if (newPosition > this.value.length)
                        newPosition = this.value.length;
                    this.setSelectionRange(newPosition, newPosition);
                }
            });

            // Валидация при потере фокуса
            input.addEventListener("blur", function () {
                validateDate(this);
            });

            // Валидация при изменении
            input.addEventListener("change", function () {
                validateDate(this);
            });

            // Убираем классы при вводе
            input.addEventListener("focus", function () {
                this.classList.remove("is-valid", "is-invalid");
            });

            // Запрещаем ввод букв
            input.addEventListener("keydown", function (e) {
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

            // Обработка вставки
            input.addEventListener("paste", function (e) {
                setTimeout(function () {
                    dateMask(input);
                    validateDate(input);
                }, 10);
            });
        });
    }

    // ============================================
    // 3. ВАЛИДАЦИЯ ВОЗРАСТА
    // ============================================

    const ageInput = form.querySelector('input[name="age"]');
    if (ageInput) {
        ageInput.addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "");
            if (this.value.length > 3) this.value = this.value.substring(0, 3);

            this.classList.remove("is-valid", "is-invalid");

            const field = this.closest(".field");
            const errorSpan = field
                ? field.querySelector('[data-formit-error="age"]')
                : null;
            if (errorSpan) {
                errorSpan.textContent = "";
            }
        });

        ageInput.addEventListener("blur", function () {
            const value = this.value.trim();
            const field = this.closest(".field");
            const errorSpan = field
                ? field.querySelector('[data-formit-error="age"]')
                : null;

            this.classList.remove("is-valid", "is-invalid");

            if (!value) {
                this.classList.add("is-invalid");
                if (errorSpan) {
                    errorSpan.textContent = "Введите возраст";
                }
                return;
            }

            const val = parseInt(value);
            if (isNaN(val) || val < 1 || val > 150) {
                this.classList.add("is-invalid");
                if (errorSpan) {
                    if (val < 1) {
                        errorSpan.textContent = "Возраст должен быть больше 0";
                    } else if (val > 150) {
                        errorSpan.textContent =
                            "Возраст не может быть больше 150";
                    } else {
                        errorSpan.textContent = "Введите корректный возраст";
                    }
                }
            } else {
                this.classList.add("is-valid");
                if (errorSpan) {
                    errorSpan.textContent = "";
                }
            }
        });

        ageInput.addEventListener("change", function () {
            this.dispatchEvent(new Event("blur"));
        });
    }

    // ============================================
    // 4. ВАЛИДАЦИЯ EMAIL
    // ============================================

    function validateEmail(input) {
        const value = input.value.trim();
        const field = input.closest(".field");
        const errorSpan = field
            ? field.querySelector('[data-formit-error="email"]')
            : null;

        input.classList.remove("is-valid", "is-invalid");

        if (!value) {
            if (errorSpan) {
                errorSpan.textContent = "Введите email";
            }
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
            } else {
                const domainPart = value.substring(value.lastIndexOf(".") + 1);
                if (domainPart.length < 2) {
                    errorMessage =
                        "Введите корректное расширение домена (например, .com, .ru)";
                }
            }

            if (errorSpan) {
                errorSpan.textContent = errorMessage;
            }
            input.classList.add("is-invalid");
            return false;
        }

        if (errorSpan) {
            errorSpan.textContent = "";
        }
        input.classList.add("is-valid");
        return true;
    }

    const emailInput = form.querySelector('input[name="email"]');
    if (emailInput) {
        emailInput.addEventListener("input", function () {
            if (!this.value.trim()) {
                this.classList.remove("is-valid", "is-invalid");
                const field = this.closest(".field");
                const errorSpan = field
                    ? field.querySelector('[data-formit-error="email"]')
                    : null;
                if (errorSpan) {
                    errorSpan.textContent = "";
                }
                return;
            }
            validateEmail(this);
        });

        emailInput.addEventListener("blur", function () {
            if (this.value.trim()) {
                validateEmail(this);
            } else {
                this.classList.remove("is-valid", "is-invalid");
            }
        });
    }

    // ============================================
    // 5. ТАБЛИЦА МЕРОПРИЯТИЙ
    // ============================================

    const booksTableBody = document.getElementById("booksTableBody");
    const addBookBtn = document.getElementById("addBookBtn");
    const bookCountInput = document.getElementById("bookCount");
    const MAX_BOOKS = 10;

    if (booksTableBody) {
        function updateRowNumbers() {
            const rows = booksTableBody.querySelectorAll(".books-table__row");
            rows.forEach(function (row, index) {
                const numberCol = row.querySelector(
                    ".books-table__col--number",
                );
                if (numberCol) {
                    numberCol.textContent = index + 1;
                }
                row.dataset.rowIndex = index;
            });
        }

        function updateRemoveButtons() {
            const rows = booksTableBody.querySelectorAll(".books-table__row");
            const removeBtns = booksTableBody.querySelectorAll(
                ".books-table__remove-btn",
            );

            removeBtns.forEach(function (btn) {
                if (rows.length <= 1) {
                    btn.style.display = "none";
                } else {
                    btn.style.display = "flex";
                }
            });
        }

        function updateBookCount() {
            const rows = booksTableBody.querySelectorAll(".books-table__row");
            const count = rows.length;
            if (bookCountInput) {
                bookCountInput.value = count;
            }

            if (addBookBtn) {
                if (count >= MAX_BOOKS) {
                    addBookBtn.disabled = true;
                } else {
                    addBookBtn.disabled = false;
                }
            }
        }

        function validateBookField(input) {
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
            } else {
                input.classList.remove("is-invalid");
                if (errorSpan) {
                    errorSpan.textContent = "";
                }
                return true;
            }
        }

        function addBookRow() {
            const rows = booksTableBody.querySelectorAll(".books-table__row");
            const currentCount = rows.length;

            if (currentCount >= MAX_BOOKS) {
                alert("Максимальное количество залов: " + MAX_BOOKS);
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

            booksTableBody.appendChild(row);

            const newAuthorInput = row.querySelector(
                'input[name="book_author[]"]',
            );
            const newTitleInput = row.querySelector(
                'input[name="book_title[]"]',
            );
            const newYearInput = row.querySelector('input[name="book_year[]"]');

            if (newAuthorInput) {
                newAuthorInput.addEventListener("blur", function () {
                    validateBookField(this);
                });
                newAuthorInput.addEventListener("input", function () {
                    if (this.value.trim()) {
                        this.classList.remove("is-invalid");
                        const errorSpan =
                            this.closest(".books-table__col").querySelector(
                                ".field__error",
                            );
                        if (errorSpan) {
                            errorSpan.textContent = "";
                        }
                    }
                });
            }

            if (newTitleInput) {
                newTitleInput.addEventListener("blur", function () {
                    validateBookField(this);
                });
                newTitleInput.addEventListener("input", function () {
                    if (this.value.trim()) {
                        this.classList.remove("is-invalid");
                        const errorSpan =
                            this.closest(".books-table__col").querySelector(
                                ".field__error",
                            );
                        if (errorSpan) {
                            errorSpan.textContent = "";
                        }
                    }
                });
            }

            if (newYearInput) {
                // Применяем маску даты к новому полю
                newYearInput.addEventListener("input", function () {
                    const cursorPosition = this.selectionStart;
                    dateMask(this);
                    if (cursorPosition) {
                        let newPosition = cursorPosition;
                        if (cursorPosition > 2 && cursorPosition <= 3)
                            newPosition = cursorPosition + 1;
                        if (cursorPosition > 5 && cursorPosition <= 6)
                            newPosition = cursorPosition + 1;
                        if (newPosition > this.value.length)
                            newPosition = this.value.length;
                        this.setSelectionRange(newPosition, newPosition);
                    }
                });

                newYearInput.addEventListener("blur", function () {
                    validateDate(this);
                });

                newYearInput.addEventListener("focus", function () {
                    this.classList.remove("is-valid", "is-invalid");
                });

                newYearInput.addEventListener("keydown", function (e) {
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
            }

            updateRowNumbers();
            updateRemoveButtons();
            updateBookCount();

            setTimeout(function () {
                row.classList.remove("books-table__row--adding");
            }, 300);
        }

        function removeBookRow(button) {
            const row = button.closest(".books-table__row");
            const rows = booksTableBody.querySelectorAll(".books-table__row");

            if (rows.length <= 1) {
                return;
            }

            row.classList.add("books-table__row--removing");

            setTimeout(function () {
                row.remove();
                updateRowNumbers();
                updateRemoveButtons();
                updateBookCount();
            }, 300);
        }

        if (addBookBtn) {
            addBookBtn.addEventListener("click", function (e) {
                e.preventDefault();
                addBookRow();
            });
        }

        if (booksTableBody) {
            booksTableBody.addEventListener("click", function (e) {
                const removeBtn = e.target.closest(".books-table__remove-btn");
                if (removeBtn) {
                    e.preventDefault();
                    removeBookRow(removeBtn);
                }
            });
        }

        // Инициализация существующих полей
        booksTableBody
            .querySelectorAll(
                'input[name="book_author[]"], input[name="book_title[]"]',
            )
            .forEach(function (input) {
                input.addEventListener("blur", function () {
                    validateBookField(this);
                });
                input.addEventListener("input", function () {
                    if (this.value.trim()) {
                        this.classList.remove("is-invalid");
                        const errorSpan =
                            this.closest(".books-table__col").querySelector(
                                ".field__error",
                            );
                        if (errorSpan) {
                            errorSpan.textContent = "";
                        }
                    }
                });
            });

        // Инициализация маски даты для существующих полей
        initDateFields(booksTableBody);

        updateBookCount();
        updateRemoveButtons();
        console.log("✅ Таблица мероприятий инициализирована");
    }

    // ============================================
    // 6. ВАЛИДАЦИЯ ПЕРЕД ОТПРАВКОЙ
    // ============================================

    form.addEventListener("submit", function (e) {
        let hasErrors = false;
        let firstErrorField = null;

        // Проверка имени
        const nameInput = form.querySelector('input[name="name"]');
        if (nameInput && !nameInput.value.trim()) {
            nameInput.classList.add("is-invalid");
            const errorSpan = nameInput
                .closest(".field")
                .querySelector('[data-formit-error="name"]');
            if (errorSpan) {
                errorSpan.textContent = "Введите ФИО";
            }
            hasErrors = true;
            if (!firstErrorField) firstErrorField = nameInput;
        }

        // Проверка возраста
        const ageInput2 = form.querySelector('input[name="age"]');
        if (ageInput2) {
            const value = ageInput2.value.trim();
            const field = ageInput2.closest(".field");
            const errorSpan = field
                ? field.querySelector('[data-formit-error="age"]')
                : null;

            if (!value) {
                ageInput2.classList.add("is-invalid");
                if (errorSpan) {
                    errorSpan.textContent = "Введите возраст";
                }
                hasErrors = true;
                if (!firstErrorField) firstErrorField = ageInput2;
            } else {
                const val = parseInt(value);
                if (isNaN(val) || val < 1 || val > 150) {
                    ageInput2.classList.add("is-invalid");
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
                    if (!firstErrorField) firstErrorField = ageInput2;
                } else {
                    ageInput2.classList.remove("is-invalid");
                    ageInput2.classList.add("is-valid");
                    if (errorSpan) {
                        errorSpan.textContent = "";
                    }
                }
            }
        }

        // Проверка телефона
        const phoneInput2 = form.querySelector('input[name="phone"]');
        if (phoneInput2) {
            const phoneClean = phoneInput2.value.replace(/\D/g, "");
            if (phoneClean.length < 11) {
                phoneInput2.classList.add("is-invalid");
                const errorSpan = phoneInput2
                    .closest(".field")
                    .querySelector('[data-formit-error="phone"]');
                if (errorSpan) {
                    errorSpan.textContent = "Введите корректный номер телефона";
                }
                hasErrors = true;
                if (!firstErrorField) firstErrorField = phoneInput2;
            }
        }

        // Проверка email
        if (emailInput && !validateEmail(emailInput)) {
            hasErrors = true;
            if (!firstErrorField) firstErrorField = emailInput;
        }

        // Проверка таблицы мероприятий
        if (booksTableBody) {
            const rows = booksTableBody.querySelectorAll(".books-table__row");
            rows.forEach(function (row) {
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
                    if (errorSpan) {
                        errorSpan.textContent = "Введите название зала";
                    }
                    hasErrors = true;
                    if (!firstErrorField) firstErrorField = authorInput;
                }

                if (titleInput && !titleInput.value.trim()) {
                    titleInput.classList.add("is-invalid");
                    const errorSpan = titleInput
                        .closest(".books-table__col")
                        .querySelector(".field__error");
                    if (errorSpan) {
                        errorSpan.textContent = "Введите мероприятие";
                    }
                    hasErrors = true;
                    if (!firstErrorField) firstErrorField = titleInput;
                }
            });
        }

        if (hasErrors) {
            e.preventDefault();

            if (firstErrorField) {
                setTimeout(function () {
                    const headerOffset = 100;
                    const elementPosition =
                        firstErrorField.getBoundingClientRect().top;
                    const offsetPosition =
                        elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                    });
                    firstErrorField.focus();
                    firstErrorField.classList.add("highlight-error");
                    setTimeout(function () {
                        firstErrorField.classList.remove("highlight-error");
                    }, 2000);
                }, 100);
            }
        }
    });

    // ============================================
    // 7. ОБРАБОТКА СОБЫТИЙ FORMIT
    // ============================================

    document.addEventListener("formit:error", function (e) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Отправить заявку";
        }

        const errorSpans = form.querySelectorAll("[data-formit-error]");
        errorSpans.forEach(function (span) {
            if (span.textContent.trim()) {
                const field = span.closest(".field");
                if (field) {
                    const input = field.querySelector(
                        "input, textarea, select",
                    );
                    if (input) {
                        input.classList.add("is-invalid");
                    }
                    field.classList.add("has-error");
                }
            }
        });

        setTimeout(function () {
            const errorSpansInForm = form.querySelectorAll(
                "[data-formit-error]",
            );
            let firstErrorField = null;
            let firstInput = null;

            for (const span of errorSpansInForm) {
                if (span.textContent.trim()) {
                    const field = span.closest(".field");
                    if (field) {
                        firstErrorField = field;
                        firstInput = field.querySelector(
                            "input, textarea, select",
                        );
                        break;
                    }
                }
            }

            if (firstErrorField) {
                const headerOffset = 100;
                const elementPosition =
                    firstErrorField.getBoundingClientRect().top;
                const offsetPosition =
                    elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                });

                if (firstInput) {
                    setTimeout(function () {
                        firstInput.focus();
                        firstInput.classList.add("highlight-error");
                        setTimeout(function () {
                            firstInput.classList.remove("highlight-error");
                        }, 2000);
                    }, 400);
                }
            }
        }, 400);
    });

    document.addEventListener("formit:success", function (e) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Отправить заявку";
        }
    });

    document.addEventListener("formit:beforeSubmit", function (e) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = "Отправка...";
        }
    });

    form.querySelectorAll("input, textarea, select").forEach(function (input) {
        input.addEventListener("input", function () {
            if (this.classList.contains("is-invalid")) {
                this.classList.remove("is-invalid");
                const field = this.closest(".field");
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

    console.log("✅ Форма полностью инициализирована");
});
