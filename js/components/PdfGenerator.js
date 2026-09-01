/**
 * PdfGenerator — компонент для генерации PDF (обновлен для FetchIt)
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
        this.isInitialized = false;

        this.init = this.init.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleFetchItSuccess = this.handleFetchItSuccess.bind(this);
        this.generatePDF = this.generatePDF.bind(this);
        this.destroy = this.destroy.bind(this);

        this.init();
    }

    init() {
        if (this.isInitialized) return;

        if (!this.form) {
            this._log('ℹ️ Форма не найдена');
            return;
        }

        this._bindEvents();
        this.isInitialized = true;
        this._log('✅ PdfGenerator initialized');

        return this;
    }

    _bindEvents() {
        // Событие отправки формы (сохраняем данные)
        this.form.addEventListener('submit', this.handleSubmit);

        // События FetchIt
        document.addEventListener('fetchit:after', this.handleFetchItSuccess);
        // Можно использовать fetchit:success, если нужно реагировать только на успех
        // document.addEventListener('fetchit:success', this.handleFetchItSuccess);
    }

    handleSubmit(e) {
        if (!this.checkbox || !this.checkbox.checked) return;

        this._log('🔄 Сохраняем данные формы...');

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

        try {
            sessionStorage.setItem('formDataForPDF', JSON.stringify(data));
            this._log('✅ Данные сохранены');
        } catch (error) {
            this._log('❌ Ошибка сохранения:', error);
        }
    }

    /**
     * Обработчик ответа от FetchIt
     */
    handleFetchItSuccess(e) {
        const { response } = e.detail;

        // Проверяем, что это ответ для нашей формы
        if (!this.form || e.detail.form?.id !== this.form.id) return;

        this._log('📡 Получен ответ от FetchIt:', response);

        // Проверяем, успешна ли отправка
        if (response.success) {
            this._log('✅ FetchIt: успешная отправка!');
            this._generatePDFAfterSubmit();
        } else {
            this._log('❌ FetchIt: ошибка отправки', response.message);
        }
    }

    _generatePDFAfterSubmit() {
        if (this.checkbox && !this.checkbox.checked) {
            this._log('ℹ️ Чекбокс не отмечен');
            return;
        }

        setTimeout(() => {
            this._generatePDFFromStorage();
        }, 300);
    }

    _generatePDFFromStorage() {
        if (this.isGenerating) return;
        this.isGenerating = true;
        this._log('🔄 Генерация PDF...');

        let formData = null;
        try {
            const stored = sessionStorage.getItem('formDataForPDF');
            if (stored) {
                const data = JSON.parse(stored);
                formData = new FormData();
                for (const [key, value] of Object.entries(data)) {
                    if (Array.isArray(value)) {
                        value.forEach(item => formData.append(key + '[]', item));
                    } else {
                        formData.append(key, value);
                    }
                }
                this._log('✅ Данные получены из storage');
            }
        } catch (error) {
            this._log('❌ Ошибка получения данных:', error);
        }

        if (!formData || !formData.get('name')) {
            this._log('ℹ️ Данных в storage нет, используем форму');
            if (this.form) formData = new FormData(this.form);
        }

        if (!formData || !formData.get('name')) {
            this._log('❌ Нет данных для PDF');
            this.isGenerating = false;
            return;
        }

        fetch(this.config.pdfUrl, {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.blob();
            })
            .then(blob => {
                const url = URL.createObjectURL(blob);
                const pdfWindow = window.open(url, '_blank');
                if (!pdfWindow) alert('⚠️ Разрешите всплывающие окна для PDF');
                this._log('✅ PDF создан');
                this.isGenerating = false;
                sessionStorage.removeItem('formDataForPDF');
            })
            .catch(error => {
                this._log('❌ Ошибка:', error);
                this.isGenerating = false;
            });
    }

    /**
     * Прямая генерация PDF (для отладки)
     */
    generatePDF() {
        if (!this.form) return;
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
        sessionStorage.setItem('formDataForPDF', JSON.stringify(data));
        this._generatePDFAfterSubmit();
    }

    _log(...args) {
        if (this.config.debug) console.log('[PdfGenerator]', ...args);
    }

    getState() {
        return {
            isInitialized: this.isInitialized,
            isGenerating: this.isGenerating,
            hasForm: !!this.form,
            hasCheckbox: !!this.checkbox,
            isCheckboxChecked: this.checkbox?.checked || false,
        };
    }

    destroy() {
        if (!this.isInitialized) return;
        this.form?.removeEventListener('submit', this.handleSubmit);
        document.removeEventListener('fetchit:after', this.handleFetchItSuccess);
        this.isInitialized = false;
        this._log('🔄 PdfGenerator destroyed');
    }
}