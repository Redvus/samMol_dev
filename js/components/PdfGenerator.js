/**
 * PdfGenerator — компонент для генерации PDF
 * @class PdfGenerator
 */
export default class PdfGenerator {
    constructor(options = {}) {
        this.config = {
            formSelector: '#formRetail',
            checkboxSelector: '#generatePdf',
            pdfUrl: '/assets/snippets/generatePDF.php',
            debug: true,
            ...options
        };

        this.form = document.querySelector(this.config.formSelector);
        this.checkbox = document.querySelector(this.config.checkboxSelector);
        this.submitBtn = this.form?.querySelector('.btn--base[type="submit"]');

        this.isInitialized = false;
        this.isGenerating = false;
        this.savedFormData = null; // ← храним данные

        this.init = this.init.bind(this);
        this.generatePDF = this.generatePDF.bind(this);
        this.destroy = this.destroy.bind(this);
        this.getState = this.getState.bind(this);
        this.handleFormItBeforeSubmit = this.handleFormItBeforeSubmit.bind(this);
        this.handleFormItSuccess = this.handleFormItSuccess.bind(this);
        this.handleFormItError = this.handleFormItError.bind(this);

        this.init();
    }

    init() {
        if (this.isInitialized) {
            console.warn('⚠️ PdfGenerator already initialized');
            return this;
        }

        if (!this.form) {
            this._log('ℹ️ Форма не найдена на странице');
            return this;
        }

        this._bindEvents();
        this.isInitialized = true;
        this._log('✅ PdfGenerator initialized');

        return this;
    }

    _bindEvents() {
        // 🔥 Слушаем событие ПЕРЕД отправкой
        document.addEventListener('formit:beforeSubmit', this.handleFormItBeforeSubmit);
        document.addEventListener('formit:success', this.handleFormItSuccess);
        document.addEventListener('formit:error', this.handleFormItError);
    }

    /**
     * 🔥 Сохраняем данные ДО отправки
     */
    handleFormItBeforeSubmit(e) {
        if (!this.checkbox || !this.checkbox.checked) {
            this._log('ℹ️ Чекбокс не отмечен, данные не сохраняем');
            return;
        }

        this._log('🔄 Сохраняем данные формы ДО отправки...');

        const formData = new FormData(this.form);
        const data = {};

        for (const [key, value] of formData) {
            if (key.endsWith('[]')) {
                const cleanKey = key.slice(0, -2);
                if (!data[cleanKey]) data[cleanKey] = [];
                data[cleanKey].push(value);
            } else if (key !== 'generate_pdf' && key !== 'formit' && key !== 'formName') {
                data[key] = value;
            }
        }

        this.savedFormData = data;
        this._log('✅ Данные сохранены', data);
    }

    /**
     * Обработчик успешной отправки формы
     */
    handleFormItSuccess(e) {
        this._log('✅ FormIt: успешная отправка');

        // Проверяем чекбокс
        if (!this.checkbox || !this.checkbox.checked) {
            this._log('ℹ️ Чекбокс не отмечен, PDF не создаем');
            return;
        }

        // Проверяем, есть ли сохраненные данные
        if (!this.savedFormData || Object.keys(this.savedFormData).length === 0) {
            this._log('ℹ️ Нет сохраненных данных, пробуем из формы...');
            this._generatePDFFromForm();
            return;
        }

        // Генерируем PDF из сохраненных данных
        setTimeout(() => {
            this._generatePDFFromSavedData();
        }, 300);
    }

    /**
     * Обработчик ошибки формы
     */
    handleFormItError(e) {
        this._log('❌ FormIt: ошибка валидации');
        this.savedFormData = null; // Очищаем сохраненные данные при ошибке
    }

    /**
     * Генерация PDF из сохраненных данных
     */
    _generatePDFFromSavedData() {
        if (this.isGenerating) return;
        if (!this.savedFormData) {
            this._log('❌ Нет сохраненных данных');
            return;
        }

        this.isGenerating = true;
        this._log('🔄 Генерация PDF из сохраненных данных...');

        const formData = new FormData();
        for (const [key, value] of Object.entries(this.savedFormData)) {
            if (Array.isArray(value)) {
                value.forEach(item => formData.append(key + '[]', item));
            } else {
                formData.append(key, value);
            }
        }

        // Проверяем, есть ли данные
        const name = formData.get('name');
        if (!name) {
            this._log('❌ Нет данных для PDF');
            this.isGenerating = false;
            this.savedFormData = null;
            return;
        }

        this._sendPDFRequest(formData);
    }

    /**
     * Генерация PDF из данных формы (если форма еще не очищена)
     */
    _generatePDFFromForm() {
        if (this.isGenerating) return;
        if (!this.form) {
            this._log('❌ Форма не найдена');
            return;
        }

        this.isGenerating = true;
        this._log('🔄 Генерация PDF из формы...');

        const formData = new FormData(this.form);

        // Проверяем, есть ли данные
        const name = formData.get('name');
        if (!name) {
            this._log('❌ Нет данных для PDF');
            this.isGenerating = false;
            return;
        }

        this._sendPDFRequest(formData);
    }

    /**
     * Отправка запроса на генерацию PDF
     */
    _sendPDFRequest(formData) {
        fetch(this.config.pdfUrl, {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`HTTP ${response.status}: ${text.substring(0, 200)}`);
                    });
                }
                return response.blob();
            })
            .then(blob => {
                const url = URL.createObjectURL(blob);
                const pdfWindow = window.open(url, '_blank');

                if (!pdfWindow) {
                    alert('⚠️ Пожалуйста, разрешите всплывающие окна для PDF');
                }

                this._log('✅ PDF создан и открыт');
                this.isGenerating = false;
                this.savedFormData = null;
            })
            .catch(error => {
                this._log('❌ Ошибка генерации PDF:', error);
                this.isGenerating = false;
            });
    }

    /**
     * Ручная генерация PDF (для отладки)
     */
    generatePDF() {
        if (!this.form) return;

        // Собираем данные прямо сейчас
        const formData = new FormData(this.form);
        const data = {};
        for (const [key, value] of formData) {
            if (key.endsWith('[]')) {
                const cleanKey = key.slice(0, -2);
                if (!data[cleanKey]) data[cleanKey] = [];
                data[cleanKey].push(value);
            } else if (key !== 'generate_pdf') {
                data[key] = value;
            }
        }
        this.savedFormData = data;
        this._generatePDFFromSavedData();
    }

    _log(...args) {
        if (this.config.debug) {
            console.log('[PdfGenerator]', ...args);
        }
    }

    getState() {
        return {
            isInitialized: this.isInitialized,
            isGenerating: this.isGenerating,
            hasForm: !!this.form,
            hasCheckbox: !!this.checkbox,
            isCheckboxChecked: this.checkbox?.checked || false,
            hasSavedData: !!this.savedFormData,
        };
    }

    destroy() {
        if (!this.isInitialized) return;

        document.removeEventListener('formit:beforeSubmit', this.handleFormItBeforeSubmit);
        document.removeEventListener('formit:success', this.handleFormItSuccess);
        document.removeEventListener('formit:error', this.handleFormItError);

        this.isInitialized = false;
        this.savedFormData = null;
        this._log('🔄 PdfGenerator destroyed');
    }
}