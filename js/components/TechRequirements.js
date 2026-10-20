export class TechRequirements {
    constructor(options = {}) {
        this.config = {
            formSelector: '#formRetail',
            checkboxSelector: 'input[name="hall[]"]',
            containerSelector: '#techRequirementsBody',
            selectedHallsSelector: '#selectedHalls',

            limits: {
                'Актовый зал': {tv: 2, flipchart: 9, chairs: 120, armchairs: 3, microphones: 4, tables: 9},
                'Зал Космос': {tv: 1, flipchart: 8, chairs: 60, armchairs: 3, microphones: 2, tables: 8},
                'Конференц-зал': {tv: 1, flipchart: 4, chairs: 45, armchairs: 2, microphones: 2, tables: 10},
                'Зал Добра': {tv: 1, flipchart: 2, chairs: 20, armchairs: 0, microphones: 0, tables: 5},
                'Зал совещаний': {tv: 1, flipchart: 1, chairs: 35, armchairs: 0, microphones: 0, tables: 0},
                'Студия звукозаписи': {flipchart: 0, tv: 1, chairs: 10, armchairs: 0, microphones: 2, tables: 0},
            },

            defaultLimits: {tv: 1, flipchart: 1, chairs: 20, armchairs: 5, microphones: 1, tables: 3},

            ...options
        };

        this.form = document.querySelector(this.config.formSelector);
        this.container = document.querySelector(this.config.containerSelector);
        this.selectedHallsInput = document.querySelector(this.config.selectedHallsSelector);
        this.checkboxes = document.querySelectorAll(this.config.checkboxSelector);

        this.isInitialized = false;
        this.rows = [];

        this.init = this.init.bind(this);
        this.updateRows = this.updateRows.bind(this);
        this.destroy = this.destroy.bind(this);
        this.getState = this.getState.bind(this);

        this.init();
    }

    init() {
        if (this.isInitialized) return this;

        if (!this.form || !this.container) {
            console.log('ℹ️ TechRequirements: форма или контейнер не найдены');
            return this;
        }

        this._bindEvents();
        this.isInitialized = true;
        console.log('✅ TechRequirements initialized');

        return this;
    }

    _bindEvents() {
        this.checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', this.updateRows);
        });

        // 🔥 Подсветка при любой попытке отправки
        this._onSubmit = (e) => {
            this._validateRows();
        };
        this.form.addEventListener('submit', this._onSubmit, true);

        // 🔥 Подсветка при AJAX-ошибке FormIt
        this._onFormitError = (e) => {
            this._validateRows();
        };
        document.addEventListener('formit:error', this._onFormitError);

        // Снятие ошибки при вводе
        this._onInput = (e) => {
            if (e.target.classList.contains('tech-requirements__input')) {
                e.target.classList.remove('is-invalid');
            }
        };
        this.container.addEventListener('input', this._onInput);

        this.updateRows();
    }

    /**
     * 🔥 Подсветка полей с ошибками
     * @private
     */
    _highlightErrors() {
        const inputs = this.container.querySelectorAll('input[data-limit]');

        inputs.forEach(input => {
            const limit = parseInt(input.dataset.limit, 10) || 0;
            const value = parseInt(input.value, 10) || 0;

            if (limit > 0 && value > limit) {
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
            }
        });
    }

    _getHallLimits(hall) {
        return this.config.limits[hall] || this.config.defaultLimits;
    }

    updateRows() {
        const selectedHalls = [];
        this.checkboxes.forEach(cb => {
            if (cb.checked) selectedHalls.push(cb.value);
        });

        if (this.selectedHallsInput) {
            this.selectedHallsInput.value = selectedHalls.join(', ');
        }

        const currentValues = this._getCurrentValues();

        this.container.innerHTML = '';
        this.rows = [];

        selectedHalls.forEach((hall, index) => {
            const limits = this._getHallLimits(hall);
            const row = this._createRow(hall, index, currentValues[hall] || {}, limits);
            this.container.appendChild(row);
            this.rows.push(row);
        });

        if (selectedHalls.length === 0) {
            this.container.innerHTML = `
                <div class="tech-requirements__empty">
                    Выберите площадку, чтобы указать технические требования
                </div>
            `;
        }
    }

    _getCurrentValues() {
        const values = {};
        const rows = this.container.querySelectorAll('.tech-requirements__row');

        rows.forEach(row => {
            const hall = row.dataset.hall;
            if (!hall) return;

            values[hall] = {
                tv: row.querySelector('select[name="tech_tv[]"]')?.value || 'Нет',
                flipchart: row.querySelector('input[name="tech_flipchart[]"]')?.value || '',
                chairs: row.querySelector('input[name="tech_chairs[]"]')?.value || '',
                armchairs: row.querySelector('input[name="tech_armchairs[]"]')?.value || '',
                microphones: row.querySelector('input[name="tech_microphones[]"]')?.value || '',
                sound: row.querySelector('select[name="tech_sound[]"]')?.value || 'Нет',
                laptop: row.querySelector('select[name="tech_laptop[]"]')?.value || 'Нет',
                tables: row.querySelector('input[name="tech_tables[]"]')?.value || '',
                tables_form: row.querySelector('select[name="tech_tables_form[]"]')?.value || 'Конференц-стол',
            };
        });

        return values;
    }

    _createRow(hall, index, values = {}, limits = {}) {
        const row = document.createElement('div');
        row.className = 'tech-requirements__row';
        row.dataset.hall = hall;
        row.dataset.index = index;

        const safeHall = hall.replace(/"/g, '&quot;');

        // 🔥 Плейсхолдеры с лимитами — только если лимит > 0
        const makePlaceholder = (limit) => {
            const num = parseInt(limit, 10) || 0;
            return num > 0 ? `до ${num}` : '-';
        };

        // 🔥 Флаг: readonly, если лимит <= 0
        const makeReadonly = (limit) => {
            const num = parseInt(limit, 10) || 0;
            return num <= 0 ? 'readonly tabindex="-1"' : '';
        };

        const flipchartPlaceholder = makePlaceholder(limits.flipchart);
        const chairsPlaceholder = makePlaceholder(limits.chairs);
        const armchairsPlaceholder = makePlaceholder(limits.armchairs);
        const microphonesPlaceholder = makePlaceholder(limits.microphones);
        const tablesPlaceholder = makePlaceholder(limits.tables);

        // 🔥 Условия для формы столов
        const isAssemblyHall = hall === 'Актовый зал';
        const isMeetingRoom = hall === 'Зал совещаний';

        let tablesFormField;

        if (isAssemblyHall) {
            // Актовый зал — выбор между Прямоугольные и Круглые
            tablesFormField = `
        <div class="tech-requirements__col tech-requirements__col--tables-form">
            <select name="tech_tables_form[]" class="tech-requirements__select">
                <option value="Прямоугольные" ${values.tables_form === 'Прямоугольные' ? 'selected' : ''}>Прямоугольные</option>
                <option value="Круглые" ${values.tables_form === 'Круглые' ? 'selected' : ''}>Круглые</option>
            </select>
        </div>
    `;
        } else if (isMeetingRoom) {
            // Зал совещаний — фиксированный Конференц-стол
            tablesFormField = `
        <div class="tech-requirements__col tech-requirements__col--tables-form">
            <input type="text" 
                   name="tech_tables_form[]" 
                   class="tech-requirements__input tech-requirements__input--readonly" 
                   value="Конференц-стол" 
                   readonly 
                   tabindex="-1">
        </div>
    `;
        } else {
            // Остальные — фиксированные Прямоугольные
            tablesFormField = `
        <div class="tech-requirements__col tech-requirements__col--tables-form">
            <input type="text" 
                   name="tech_tables_form[]" 
                   class="tech-requirements__input tech-requirements__input--readonly" 
                   value="Прямоугольные" 
                   readonly 
                   tabindex="-1">
        </div>
    `;
        }

        row.innerHTML = `
        <span class="tech-requirements__col tech-requirements__col--hall">
            <span class="tech-requirements__hall-name">${safeHall}</span>
            <input type="hidden" name="tech_hall[]" value="${safeHall}">
        </span>
        <div class="tech-requirements__col tech-requirements__col--tv">
            <select name="tech_tv[]" class="tech-requirements__select">
                <option value="Нет" ${values.tv === 'Нет' ? 'selected' : ''}>Нет</option>
                <option value="Да" ${values.tv === 'Да' ? 'selected' : ''}>Да</option>
            </select>
        </div>
        <div class="tech-requirements__col tech-requirements__col--flipchart">
            <input type="text" 
                   name="tech_flipchart[]" 
                   class="tech-requirements__input" 
                   placeholder="${flipchartPlaceholder}" 
                   value="${values.flipchart || ''}"
                   data-limit="${limits.flipchart || 0}"
                   data-field="flipchart"
                   ${makeReadonly(limits.flipchart)}>
        </div>
        <div class="tech-requirements__col tech-requirements__col--chairs">
            <input type="text" 
                   name="tech_chairs[]" 
                   class="tech-requirements__input" 
                   placeholder="${chairsPlaceholder}" 
                   value="${values.chairs || ''}"
                   data-limit="${limits.chairs || 0}"
                   data-field="chairs"
                   ${makeReadonly(limits.chairs)}>
        </div>
        <div class="tech-requirements__col tech-requirements__col--armchairs">
            <input type="text" 
                   name="tech_armchairs[]" 
                   class="tech-requirements__input" 
                   placeholder="${armchairsPlaceholder}" 
                   value="${values.armchairs || ''}"
                   data-limit="${limits.armchairs || 0}"
                   data-field="armchairs"
                   ${makeReadonly(limits.armchairs)}>
        </div>
        <div class="tech-requirements__col tech-requirements__col--micro">
            <input type="text" 
                   name="tech_microphones[]" 
                   class="tech-requirements__input" 
                   placeholder="${microphonesPlaceholder}" 
                   value="${values.microphones || ''}"
                   data-limit="${limits.microphones || 0}"
                   data-field="microphones"
                   ${makeReadonly(limits.microphones)}>
        </div>
        <div class="tech-requirements__col tech-requirements__col--sound">
            <select name="tech_sound[]" class="tech-requirements__select">
                <option value="Нет" ${values.sound === 'Нет' ? 'selected' : ''}>Нет</option>
                <option value="Да" ${values.sound === 'Да' ? 'selected' : ''}>Да</option>
            </select>
        </div>
        <div class="tech-requirements__col tech-requirements__col--laptop">
            <select name="tech_laptop[]" class="tech-requirements__select">
                <option value="Нет" ${values.laptop === 'Нет' ? 'selected' : ''}>Нет</option>
                <option value="Да" ${values.laptop === 'Да' ? 'selected' : ''}>Да</option>
            </select>
        </div>
        <div class="tech-requirements__col tech-requirements__col--tables">
            <input type="text" 
                   name="tech_tables[]" 
                   class="tech-requirements__input" 
                   placeholder="${tablesPlaceholder}" 
                   value="${values.tables || ''}"
                   data-limit="${limits.tables || 0}"
                   data-field="tables"
                   ${makeReadonly(limits.tables)}>
        </div>
        ${tablesFormField}
    `;

        this._bindLimitEvents(row);
        return row;
    }

    _bindLimitEvents(row) {
        const inputs = row.querySelectorAll('input[data-limit]');

        inputs.forEach(input => {
            const limit = parseInt(input.dataset.limit, 10) || 0;

            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');

                if (value === '') {
                    e.target.value = '';
                    return;
                }

                if (limit <= 0) {
                    e.target.value = value;
                    return;
                }

                let num = parseInt(value, 10);
                if (num > limit) {
                    num = limit;
                    this._toggleLimitError(input, value, limit);
                }
                e.target.value = num.toString();
            });

            input.addEventListener('blur', (e) => {
                if (e.target.value === '') return;
                if (limit <= 0) return;
                let num = parseInt(e.target.value, 10);
                if (isNaN(num) || num > limit) {
                    e.target.value = limit.toString();
                    this._toggleLimitError(input, num, limit);
                }
            });
        });
    }

    _toggleLimitError(input, value, limit) {
        if (limit <= 0) return;

        const existingBubble = input.parentNode.querySelector('.tech-requirements__bubble');
        if (existingBubble) existingBubble.remove();

        if (value > limit) {
            const bubble = document.createElement('div');
            bubble.className = 'tech-requirements__bubble';
            bubble.textContent = `Максимум: ${limit}`;
            input.parentNode.style.position = 'relative';
            input.parentNode.appendChild(bubble);

            requestAnimationFrame(() => {
                bubble.classList.add('tech-requirements__bubble--visible');
            });

            setTimeout(() => {
                bubble.classList.remove('tech-requirements__bubble--visible');
                setTimeout(() => bubble.remove(), 200);
            }, 2000);
        }
    }

    _validateRows() {
        const inputs = this.container.querySelectorAll('input[data-limit]');
        let hasErrors = false;

        inputs.forEach(input => {
            const limit = parseInt(input.dataset.limit, 10) || 0;
            const value = parseInt(input.value, 10) || 0;
            const rawValue = input.value.trim();

            // 🔥 Проверка на пустое поле (если лимит > 0)
            if (limit > 0 && rawValue === '') {
                input.classList.add('is-invalid');
                hasErrors = true;
            }
            // 🔥 Проверка на превышение лимита
            else if (limit > 0 && value > limit) {
                input.classList.add('is-invalid');
                hasErrors = true;
            } else {
                input.classList.remove('is-invalid');
            }
        });

        return hasErrors;
    }

    getState() {
        return {
            isInitialized: this.isInitialized,
            selectedHalls: this.selectedHallsInput?.value || '',
            rowsCount: this.rows.length,
        };
    }

    destroy() {
        if (!this.isInitialized) return;

        this.checkboxes.forEach(cb => {
            cb.removeEventListener('change', this.updateRows);
        });

        if (this._onFormitError) {
            document.removeEventListener('formit:error', this._onFormitError);
            this._onFormitError = null;
        }

        if (this._onInput) {
            this.container.removeEventListener('input', this._onInput);
            this._onInput = null;
        }

        this.isInitialized = false;
        console.log('🔄 TechRequirements destroyed');
    }
}