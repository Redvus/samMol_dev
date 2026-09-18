/**
 * TechRequirements — динамические технические требования для каждой площадки
 * @class TechRequirements
 */
export default class TechRequirements {
    constructor(options = {}) {
        this.config = {
            formSelector: '#formRetail',
            checkboxSelector: 'input[name="hall[]"]',
            containerSelector: '#techRequirementsBody',
            selectedHallsSelector: '#selectedHalls',
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

        this.updateRows();
    }

    updateRows() {
        const selectedHalls = [];
        this.checkboxes.forEach(cb => {
            if (cb.checked) {
                selectedHalls.push(cb.value);
            }
        });

        if (this.selectedHallsInput) {
            this.selectedHallsInput.value = selectedHalls.join(', ');
        }

        // Сохраняем текущие значения
        const currentValues = this._getCurrentValues();

        this.container.innerHTML = '';
        this.rows = [];

        selectedHalls.forEach((hall, index) => {
            const row = this._createRow(hall, index, currentValues[hall] || {});
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

    /**
     * Получить текущие значения из полей
     */
    _getCurrentValues() {
        const values = {};
        const rows = this.container.querySelectorAll('.tech-requirements__row');

        rows.forEach(row => {
            const hall = row.dataset.hall;
            if (!hall) return;

            values[hall] = {
                tv: row.querySelector('input[name="tech_tv[]"]')?.value || '',
                flipchart: row.querySelector('input[name="tech_flipchart[]"]')?.value || '',
                chairs: row.querySelector('input[name="tech_chairs[]"]')?.value || '',
                armchairs: row.querySelector('input[name="tech_armchairs[]"]')?.value || '',
                microphones: row.querySelector('input[name="tech_microphones[]"]')?.value || '',
                sound: row.querySelector('select[name="tech_sound[]"]')?.value || 'Нет',
                laptop: row.querySelector('select[name="tech_laptop[]"]')?.value || 'Нет',
                tables: row.querySelector('input[name="tech_tables[]"]')?.value || '',
                tables_form: row.querySelector('select[name="tech_tables_form[]"]')?.value || 'Прямоугольные',
            };
        });

        return values;
    }

    _createRow(hall, index, values = {}) {
        const row = document.createElement('div');
        row.className = 'tech-requirements__row';
        row.dataset.hall = hall;
        row.dataset.index = index;

        const safeHall = hall.replace(/"/g, '&quot;');

        row.innerHTML = `
            <span class="tech-requirements__col tech-requirements__col--hall">
                <span class="tech-requirements__hall-name">${safeHall}</span>
                <input type="hidden" name="tech_hall[]" value="${safeHall}">
            </span>
            <div class="tech-requirements__col tech-requirements__col--tv">
                <input type="text" name="tech_tv[]" class="tech-requirements__input" placeholder="0" value="${values.tv || ''}">
            </div>
            <div class="tech-requirements__col tech-requirements__col--flipchart">
                <input type="text" name="tech_flipchart[]" class="tech-requirements__input" placeholder="0" value="${values.flipchart || ''}">
            </div>
            <div class="tech-requirements__col tech-requirements__col--chairs">
                <input type="text" name="tech_chairs[]" class="tech-requirements__input" placeholder="0" value="${values.chairs || ''}">
            </div>
            <div class="tech-requirements__col tech-requirements__col--armchairs">
                <input type="text" name="tech_armchairs[]" class="tech-requirements__input" placeholder="0" value="${values.armchairs || ''}">
            </div>
            <div class="tech-requirements__col tech-requirements__col--micro">
                <input type="text" name="tech_microphones[]" class="tech-requirements__input" placeholder="0" value="${values.microphones || ''}">
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
                <input type="text" name="tech_tables[]" class="tech-requirements__input" placeholder="0" value="${values.tables || ''}">
            </div>
            <div class="tech-requirements__col tech-requirements__col--tables-form">
                <select name="tech_tables_form[]" class="tech-requirements__select">
                    <option value="Прямоугольные" ${values.tables_form === 'Прямоугольные' ? 'selected' : ''}>Прямоугольные</option>
                    <option value="Круглые" ${values.tables_form === 'Круглые' ? 'selected' : ''}>Круглые</option>
                </select>
            </div>
        `;

        return row;
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

        this.isInitialized = false;
        console.log('🔄 TechRequirements destroyed');
    }
}