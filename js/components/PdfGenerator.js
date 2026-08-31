export default class PdfGenerator {
    constructor(options = {}) {
        this.config = {
            buttonSelector: '#pdfButton',
            pdfUrl: '/assets/images/documents/form_pdf.html',  // ← URL
            ...options
        };

        this.button = document.querySelector(this.config.buttonSelector);
        this.isInitialized = false;

        this.init();
    }

    init() {
        if (this.isInitialized) return this;
        if (!this.button) {
            console.log('ℹ️ PDF button not found');
            return this;
        }

        this._bindEvents();
        this.isInitialized = true;
        console.log('✅ PdfGenerator initialized');

        return this;
    }

    _bindEvents() {
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            this.openPDF();
        });
    }

    openPDF() {
        const win = window.open(this.config.pdfUrl, '_blank', 'width=800,height=600,scrollbars=yes');

        if (!win) {
            alert('Пожалуйста, разрешите всплывающие окна для печати');
            return;
        }

        // Автоматическая печать после загрузки
        // win.onload = function() {
        //     setTimeout(function() {
        //         win.print();
        //     }, 500);
        // };
    }

    getState() {
        return {
            isInitialized: this.isInitialized,
            hasButton: !!this.button,
            pdfUrl: this.config.pdfUrl,
        };
    }

    destroy() {
        if (!this.isInitialized) return;
        this.isInitialized = false;
        console.log('🔄 PdfGenerator destroyed');
    }
}