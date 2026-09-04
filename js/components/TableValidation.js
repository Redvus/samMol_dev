// components/TableValidation.js
export default function initTableValidation() {
    const form = document.getElementById('formRetail');
    if (!form) return;

    function validateBooksTable() {
        const rows = document.querySelectorAll('.books-table__row');
        let hasErrors = false;

        rows.forEach(function(row) {
            const authorInput = row.querySelector('input[name="book_author[]"]');
            const titleInput = row.querySelector('input[name="book_title[]"]');
            const yearInput = row.querySelector('input[name="book_year[]"]');
            let rowHasError = false;

            if (authorInput && !authorInput.value.trim()) {
                authorInput.classList.add('is-invalid');
                rowHasError = true;
                hasErrors = true;
            } else {
                authorInput?.classList.remove('is-invalid');
            }

            if (titleInput && !titleInput.value.trim()) {
                titleInput.classList.add('is-invalid');
                rowHasError = true;
                hasErrors = true;
            } else {
                titleInput?.classList.remove('is-invalid');
            }

            if (yearInput && !yearInput.value.trim()) {
                yearInput.classList.add('is-invalid');
                rowHasError = true;
                hasErrors = true;
            } else {
                yearInput?.classList.remove('is-invalid');
            }

            row.classList.toggle('has-error', rowHasError);
        });

        return hasErrors;
    }

    form.addEventListener('submit', function(e) {
        const hasErrors = validateBooksTable();
        if (hasErrors) {
            e.preventDefault();
            const firstError = document.querySelector('.books-table__row .is-invalid');
            if (firstError) {
                firstError.focus();
                // firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    form.addEventListener('input', function(e) {
        const input = e.target;
        if (input.classList.contains('books-table__input')) {
            input.classList.remove('is-invalid');
            const row = input.closest('.books-table__row');
            if (row) {
                const hasErrors = row.querySelectorAll('.is-invalid').length > 0;
                row.classList.toggle('has-error', hasErrors);
            }
        }
    });
}