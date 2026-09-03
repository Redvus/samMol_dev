// components/FormRetail.js — с масками для всех полей

export default class FormRetail {
    constructor(options = {}) {
        this.config = {
            formSelector: '#formRetail',
            phoneSelector: 'input[name="phone"]',
            ageSelector: 'input[name="age"]',
            emailSelector: 'input[name="email"]',
            dateSelector: 'input[name="book_year[]"]',
            booksTableSelector: '#booksTableBody',
            addBookSelector: '#addBookBtn',
            bookCountSelector: '#bookCount',
            maxBooks: 10,
            ...options
        };

        this.form = null;
        this.phoneInput = null;
        this.ageInput = null;
        this.emailInput = null;
        this.dateInputs = [];
        this.booksTableBody = null;
        this.addBookBtn = null;
        this.bookCountInput = null;

        this.isInitialized = false;
        this.isSubmitting = false;

        this.init = this.init.bind(this);
        this.destroy = this.destroy.bind(this);
        this.getState = this.getState.bind(this);

        this.init();
    }

    init() {
        if (this.isInitialized) {
            console.warn('FormRetail already initialized');
            return this;
        }

        this.form = document.querySelector(this.config.formSelector);

        if (!this.form) {
            console.log('ℹ️ FormRetail: форма не найдена');
            return this;
        }

        console.log('✅ FormRetail: форма найдена, инициализация...');

        this._initFields();
        this._initBooksTable();
        this._bindEvents();

        this.isInitialized = true;
        console.log('✅ FormRetail initialized');

        return this;
    }

    _initFields() {
        this.phoneInput = this.form.querySelector(this.config.phoneSelector);
        this.ageInput = this.form.querySelector(this.config.ageSelector);
        this.emailInput = this.form.querySelector(this.config.emailSelector);
        this.booksTableBody = this.form.querySelector(this.config.booksTableSelector);
        this.addBookBtn = this.form.querySelector(this.config.addBookSelector);
        this.bookCountInput = this.form.querySelector(this.config.bookCountSelector);

        // Все поля с датой
        this.dateInputs = this.form.querySelectorAll(this.config.dateSelector);
    }

    _bindEvents() {
        // Маска телефона
        if (this.phoneInput) {
            this.phoneInput.addEventListener('input', (e) => this._phoneMask(e.target));
            this.phoneInput.addEventListener('focus', (e) => this._phoneFocus(e.target));
            this.phoneInput.addEventListener('blur', (e) => this._phoneBlur(e.target));
        }

        // Маска возраста (только цифры)
        if (this.ageInput) {
            this.ageInput.addEventListener('input', (e) => this._ageMask(e.target));
        }

        // Маска email (автоматическое добавление @mail.ru)
        if (this.emailInput) {
            this.emailInput.addEventListener('blur', (e) => this._emailMask(e.target));
        }

        // Маска даты для всех полей
        this.dateInputs.forEach(input => {
            input.addEventListener('input', (e) => this._dateMask(e.target));
            input.addEventListener('blur', (e) => this._dateValidate(e.target));
        });

        // Добавление строки в таблицу
        if (this.addBookBtn) {
            this.addBookBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this._addBookRow();
            });
        }

        // Удаление строки из таблицы
        if (this.booksTableBody) {
            this.booksTableBody.addEventListener('click', (e) => {
                const removeBtn = e.target.closest('.books-table__remove-btn');
                if (removeBtn) {
                    e.preventDefault();
                    this._removeBookRow(removeBtn);
                }
            });
        }

        // MutationObserver для новых полей даты
        if (this.booksTableBody) {
            const observer = new MutationObserver(() => {
                this.dateInputs = this.form.querySelectorAll(this.config.dateSelector);
                this.dateInputs.forEach(input => {
                    // Убираем дублирование событий
                    if (!input.dataset.dateMasked) {
                        input.dataset.dateMasked = 'true';
                        input.addEventListener('input', (e) => this._dateMask(e.target));
                        input.addEventListener('blur', (e) => this._dateValidate(e.target));
                    }
                });
            });

            observer.observe(this.booksTableBody, {
                childList: true,
                subtree: true,
            });
        }
    }

    // ============================================
    // МАСКА ТЕЛЕФОНА
    // ============================================

    _phoneMask(input) {
        let phone = input.value.replace(/\D/g, '');
        if (phone.length > 0 && phone[0] === '8') phone = '7' + phone.substring(1);
        if (phone.length > 0 && phone[0] === '9') phone = '7' + phone;
        if (phone.length > 0 && phone[0] !== '7') phone = '7' + phone;

        let formatted = '';
        if (phone.length > 0) {
            formatted = '+7';
            if (phone.length > 1) {
                formatted += ' (' + phone.substring(1, 4);
                if (phone.length > 4) {
                    formatted += ') ' + phone.substring(4, 7);
                    if (phone.length > 7) {
                        formatted += '-' + phone.substring(7, 9);
                        if (phone.length > 9) {
                            formatted += '-' + phone.substring(9, 11);
                        }
                    }
                }
            }
        }
        input.value = formatted;
    }

    _phoneFocus(input) {
        if (!input.value) input.value = '+7 ';
    }

    _phoneBlur(input) {
        if (input.value.replace(/\D/g, '') === '7' || input.value === '') {
            input.value = '';
        }
    }

    // ============================================
    // МАСКА ВОЗРАСТА (только цифры, 1-150)
    // ============================================

    _ageMask(input) {
        // Удаляем все нецифровые символы
        let value = input.value.replace(/\D/g, '');

        // Ограничиваем длину (макс 3 цифры для 150)
        if (value.length > 3) {
            value = value.substring(0, 3);
        }

        // Проверяем, что число не больше 150
        if (parseInt(value) > 150) {
            value = '150';
        }

        input.value = value;
    }

    // ============================================
    // МАСКА EMAIL (добавление @mail.ru)
    // ============================================

    _emailMask(input) {
        const value = input.value.trim();
        if (value && !value.includes('@')) {
            // Если email введен без @, предлагаем домен
            // Но не добавляем автоматически, чтобы не мешать пользователю
            // Можно добавить подсказку или автодополнение
            console.log('💡 Подсказка: введите email в формате user@domain.com');
        }
    }

    // ============================================
    // МАСКА ДАТЫ (ДД.ММ.ГГГГ)
    // ============================================

    _dateMask(input) {
        // Удаляем все нецифровые символы
        let value = input.value.replace(/\D/g, '');

        // Ограничиваем длину (8 цифр для ДД.ММ.ГГГГ)
        if (value.length > 8) {
            value = value.substring(0, 8);
        }

        // Форматируем с разделителями
        let formatted = '';
        for (let i = 0; i < value.length; i++) {
            if (i === 2 || i === 4) {
                formatted += '.';
            }
            formatted += value[i];
        }

        input.value = formatted;
    }

    /**
     * Валидация даты
     */
    _dateValidate(input) {
        const value = input.value.trim();
        input.classList.remove('is-valid', 'is-invalid');

        if (!value) {
            input.classList.remove('is-valid', 'is-invalid');
            return true;
        }

        const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
        const match = value.match(dateRegex);

        if (!match) {
            input.classList.add('is-invalid');
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
            input.classList.add('is-invalid');
            return false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dateObj > today) {
            input.classList.add('is-invalid');
            return false;
        }

        if (year < 1900) {
            input.classList.add('is-invalid');
            return false;
        }

        input.classList.add('is-valid');
        return true;
    }

    // ============================================
    // ТАБЛИЦА
    // ============================================

    _initBooksTable() {
        if (!this.booksTableBody) return;
        this._updateBookCount();
        this._updateRemoveButtons();
    }

    _addBookRow() {
        const rows = this.booksTableBody.querySelectorAll('.books-table__row');
        const currentCount = rows.length;

        if (currentCount >= this.config.maxBooks) {
            alert('Максимальное количество залов: ' + this.config.maxBooks);
            return;
        }

        const newIndex = currentCount;
        const row = document.createElement('div');
        row.className = 'books-table__row books-table__row--adding';
        row.dataset.rowIndex = newIndex;

        row.innerHTML = `
            <span class="books-table__col books-table__col--number">${newIndex + 1}</span>
            <div class="books-table__col books-table__col--author">
                <input type="text" name="book_author[]" class="books-table__input" placeholder="Название зала">
                <span class="field__error" data-formit-error="book_author_${newIndex}"></span>
            </div>
            <div class="books-table__col books-table__col--title">
                <input type="text" name="book_title[]" class="books-table__input" placeholder="Мероприятие">
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
        this._updateRowNumbers();
        this._updateRemoveButtons();
        this._updateBookCount();

        setTimeout(() => row.classList.remove('books-table__row--adding'), 300);
    }

    _removeBookRow(button) {
        const row = button.closest('.books-table__row');
        const rows = this.booksTableBody.querySelectorAll('.books-table__row');

        if (rows.length <= 1) return;

        row.classList.add('books-table__row--removing');

        setTimeout(() => {
            row.remove();
            this._updateRowNumbers();
            this._updateRemoveButtons();
            this._updateBookCount();
        }, 300);
    }

    _updateRowNumbers() {
        const rows = this.booksTableBody.querySelectorAll('.books-table__row');
        rows.forEach((row, index) => {
            const numberCol = row.querySelector('.books-table__col--number');
            if (numberCol) {
                numberCol.textContent = index + 1;
            }
            row.dataset.rowIndex = index;
        });
    }

    _updateRemoveButtons() {
        const rows = this.booksTableBody.querySelectorAll('.books-table__row');
        const removeBtns = this.booksTableBody.querySelectorAll('.books-table__remove-btn');

        removeBtns.forEach((btn) => {
            btn.style.display = rows.length <= 1 ? 'none' : 'flex';
        });
    }

    _updateBookCount() {
        const rows = this.booksTableBody.querySelectorAll('.books-table__row');
        const count = rows.length;

        if (this.bookCountInput) {
            this.bookCountInput.value = count;
        }

        if (this.addBookBtn) {
            this.addBookBtn.disabled = count >= this.config.maxBooks;
        }
    }

    // ============================================
    // PUBLIC METHODS
    // ============================================

    getState() {
        return {
            isInitialized: this.isInitialized,
            isSubmitting: this.isSubmitting,
            hasForm: !!this.form,
            dateInputsCount: this.dateInputs.length,
        };
    }

    destroy() {
        if (!this.isInitialized) return;
        this.isInitialized = false;
        console.log('🔄 FormRetail destroyed');
    }
}