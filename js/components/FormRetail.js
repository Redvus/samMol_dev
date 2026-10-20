// components/FormRetail.js — с масками и календарем

export default class FormRetail {
    constructor(options = {}) {
        this.config = {
            formSelector: '#formRetail',
            phoneSelector: 'input[name="phone"]',
            timeSelector: 'input[name="coffee_break_time"]',
            participantsSelector: 'input[name="event_participants"]',
            datetimeSelector: 'input[name="event_datetime"]',
            staffTimeSelector: 'input[name="event_staff_time"]',
            dateSelector: 'input[name="signature_date"]',

            // 🔥 Новые селекторы
            eventDateSelector: 'input[name="event_date"]',
            eventTimeStartSelector: 'input[name="event_time_start"]',
            eventTimeEndSelector: 'input[name="event_time_end"]',

            // 🔥 Время кофе-брейка по умолчанию
            coffeeBreakDefaultTime: '15:30',

            ...options
        };

        this.form = null;
        this.phoneInput = null;
        this.timeInput = null;
        this.participantsInput = null;
        this.datetimeInput = null;
        this.staffTimeInput = null;
        this.dateInputs = [];

        // 🔥 Новые поля
        this.eventDateInput = null;
        this.eventTimeStartInput = null;
        this.eventTimeEndInput = null;

        // 🔥 Поля кофе-брейка
        this.coffeeBreakSelect = null;
        this.coffeeBreakTimeInput = null;

        this.isInitialized = false;

        this.init = this.init.bind(this);
        this.destroy = this.destroy.bind(this);
        this.getState = this.getState.bind(this);

        this.init();
    }

    init() {
        if (this.isInitialized) return this;

        this.form = document.querySelector(this.config.formSelector);
        if (!this.form) {
            console.log('ℹ️ FormRetail: форма не найдена');
            return this;
        }

        this._initFields();
        this._bindEvents();

        this.isInitialized = true;
        console.log('✅ FormRetail initialized');

        return this;
    }

    _initFields() {
        this.phoneInput = this.form.querySelector(this.config.phoneSelector);
        this.timeInput = this.form.querySelector(this.config.timeSelector);
        this.participantsInput = this.form.querySelector(this.config.participantsSelector);
        this.datetimeInput = this.form.querySelector(this.config.datetimeSelector);
        this.staffTimeInput = this.form.querySelector(this.config.staffTimeSelector);
        this.dateInputs = this.form.querySelectorAll(this.config.dateSelector);

        // 🔥 Новые поля
        this.eventDateInput = this.form.querySelector(this.config.eventDateSelector);
        this.eventTimeStartInput = this.form.querySelector(this.config.eventTimeStartSelector);
        this.eventTimeEndInput = this.form.querySelector(this.config.eventTimeEndSelector);

        // 🔥 Поля кофе-брейка
        this.coffeeBreakSelect = this.form.querySelector('select[name="coffee_break"]');
        this.coffeeBreakTimeInput = this.form.querySelector('input[name="coffee_break_time"]');
    }

    _bindEvents() {
        // Маска телефона
        if (this.phoneInput) {
            this.phoneInput.addEventListener('input', (e) => this._phoneMask(e.target));
            this.phoneInput.addEventListener('focus', (e) => this._phoneFocus(e.target));
            this.phoneInput.addEventListener('blur', (e) => this._phoneBlur(e.target));
        }

        // Маска времени (кофе-брейк)
        if (this.timeInput) {
            this.timeInput.addEventListener('input', (e) => this._timeMask(e.target));
        }

        // Календарь для даты и времени мероприятия (старое поле)
        if (this.datetimeInput) {
            this._initDateTimePicker(this.datetimeInput);
        }

        // Маска времени прихода/ухода (ЧЧ:ММ-ЧЧ:ММ)
        if (this.staffTimeInput) {
            this._initStaffTimeMask(this.staffTimeInput);
        }

        // Маска даты для signature_date
        this.dateInputs.forEach(input => {
            input.addEventListener('input', (e) => this._dateMask(e.target));
        });

        // 🔥 Календарь для event_date
        if (this.eventDateInput) {
            this._initDatePicker(this.eventDateInput);
        }

        // 🔥 Маска времени для event_time_start
        if (this.eventTimeStartInput) {
            this.eventTimeStartInput.addEventListener('input', (e) => this._timeMask(e.target));
        }

        // 🔥 Маска времени для event_time_end
        if (this.eventTimeEndInput) {
            this.eventTimeEndInput.addEventListener('input', (e) => this._timeMask(e.target));
        }

        // 🔥 Логика кофе-брейка
        if (this.coffeeBreakSelect && this.coffeeBreakTimeInput) {
            this._initCoffeeBreakLogic();
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
    // МАСКА ВРЕМЕНИ (ЧЧ:ММ)
    // ============================================

    _timeMask(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 4) value = value.substring(0, 4);

        let formatted = '';
        for (let i = 0; i < value.length; i++) {
            if (i === 2) formatted += ':';
            formatted += value[i];
        }
        input.value = formatted;
    }

    // ============================================
    // МАСКА ВРЕМЕНИ ПРИХОДА/УХОДА (ЧЧ:ММ-ЧЧ:ММ)
    // ============================================

    _initStaffTimeMask(input) {
        if (input.dataset.maskInit) return;
        input.dataset.maskInit = 'true';

        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 8) value = value.substring(0, 8);

            let formatted = '';
            for (let i = 0; i < value.length; i++) {
                if (i === 2 || i === 6) {
                    formatted += ':';
                } else if (i === 4) {
                    formatted += '-';
                }
                formatted += value[i];
            }
            e.target.value = formatted;
        });

        input.addEventListener('blur', (e) => {
            let value = e.target.value;

            if (value && !value.includes('-')) {
                value = value + '-' + value;
            }

            const match = value.match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/);
            if (!match) {
                const parts = value.split('-');
                if (parts.length === 2) {
                    const start = this._formatTime(parts[0]);
                    const end = this._formatTime(parts[1]);
                    if (start && end) {
                        e.target.value = `${start}-${end}`;
                    }
                } else {
                    e.target.value = '';
                }
            }
        });
    }

    /**
     * Форматирование времени ЧЧ:ММ
     */
    _formatTime(value) {
        if (!value) return null;
        let v = value.replace(/\D/g, '');
        if (v.length === 3) {
            v = '0' + v;
        }
        if (v.length === 4) {
            const hours = v.substring(0, 2);
            const minutes = v.substring(2);
            if (parseInt(hours) < 24 && parseInt(minutes) < 60) {
                return `${hours}:${minutes}`;
            }
        }
        return null;
    }

    // ============================================
    // ТОЛЬКО ЦИФРЫ
    // ============================================

    _numbersOnly(input) {
        input.value = input.value.replace(/\D/g, '');
    }

    // ============================================
    // 🔥 КАЛЕНДАРЬ ДЛЯ ДАТЫ (event_date)
    // ============================================

    _initDatePicker(input) {
        if (input.dataset.pickerInit) return;
        input.dataset.pickerInit = 'true';

        const wrapper = document.createElement('div');
        wrapper.className = 'datetime-picker-wrapper';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'datetime-picker-btn';
        btn.innerHTML = '📅';
        btn.setAttribute('aria-label', 'Выбрать дату');
        // wrapper.appendChild(btn);

        const picker = document.createElement('div');
        picker.className = 'datetime-picker';
        picker.style.display = 'none';
        wrapper.appendChild(picker);

        const state = {
            viewYear: new Date().getFullYear(),
            viewMonth: new Date().getMonth(),
            selectedDate: null,
        };

        this._parseDate(input.value, state);

        const render = () => this._renderDatePicker(picker, input, state, render);

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = picker.style.display === 'block';
            this._closeAllPickers();
            if (!isOpen) {
                picker.style.display = 'block';
                this._parseDate(input.value, state);
                render();
            }
        });

        input.addEventListener('click', (e) => {
            e.stopPropagation();
            this._closeAllPickers();
            picker.style.display = 'block';
            this._parseDate(input.value, state);
            render();
        });

        document.addEventListener('click', () => {
            picker.style.display = 'none';
        });

        picker.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        render();
    }

    /**
     * Парсинг даты
     */
    _parseDate(value, state) {
        state.selectedDate = null;
        if (!value) return;

        const match = value.match(/(\d{2})\.(\d{2})\.(\d{4})/);
        if (match) {
            state.selectedDate = new Date(match[3], match[2] - 1, match[1]);
            state.viewYear = state.selectedDate.getFullYear();
            state.viewMonth = state.selectedDate.getMonth();
        }
    }

    /**
     * Отрисовка календаря (только дата)
     */
    _renderDatePicker(container, input, state, render) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const today = now.getDate();

        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

        const firstDay = new Date(state.viewYear, state.viewMonth, 1);
        const daysInMonth = new Date(state.viewYear, state.viewMonth + 1, 0).getDate();
        let startDay = firstDay.getDay() - 1;
        if (startDay < 0) startDay = 6;

        let html = `
            <div class="datetime-picker__header">
                <button type="button" class="datetime-picker__nav" data-action="prev">◀</button>
                <span class="datetime-picker__month">${monthNames[state.viewMonth]} ${state.viewYear}</span>
                <button type="button" class="datetime-picker__nav" data-action="next">▶</button>
            </div>
            <div class="datetime-picker__weekdays">
                ${weekDays.map(d => `<span>${d}</span>`).join('')}
            </div>
            <div class="datetime-picker__days">
        `;

        for (let i = 0; i < startDay; i++) {
            html += `<span class="datetime-picker__day datetime-picker__day--empty"></span>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === today && state.viewMonth === currentMonth && state.viewYear === currentYear;
            const isSelected = state.selectedDate &&
                day === state.selectedDate.getDate() &&
                state.viewMonth === state.selectedDate.getMonth() &&
                state.viewYear === state.selectedDate.getFullYear();
            const dateStr = `${String(day).padStart(2, '0')}.${String(state.viewMonth + 1).padStart(2, '0')}.${state.viewYear}`;

            html += `
                <span class="datetime-picker__day 
                    ${isToday ? 'datetime-picker__day--today' : ''} 
                    ${isSelected ? 'datetime-picker__day--selected' : ''}"
                    data-date="${dateStr}">
                    ${day}
                </span>
            `;
        }

        html += `</div>`;

        // Только кнопка "Очистить", без времени
        html += `
            <div class="datetime-picker__footer">
                <button type="button" class="datetime-picker__btn datetime-picker__btn--clear">Очистить</button>
            </div>
        `;

        container.innerHTML = html;

        // Навигация
        container.querySelector('[data-action="prev"]').addEventListener('click', (e) => {
            e.stopPropagation();
            state.viewMonth--;
            if (state.viewMonth < 0) { state.viewMonth = 11; state.viewYear--; }
            render();
        });

        container.querySelector('[data-action="next"]').addEventListener('click', (e) => {
            e.stopPropagation();
            state.viewMonth++;
            if (state.viewMonth > 11) { state.viewMonth = 0; state.viewYear++; }
            render();
        });

        // Выбор дня
        container.querySelectorAll('.datetime-picker__day[data-date]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const dateStr = el.dataset.date;
                input.value = dateStr;

                state.selectedDate = new Date(dateStr.split('.').reverse().join('-'));

                container.querySelectorAll('.datetime-picker__day').forEach(d => {
                    d.classList.remove('datetime-picker__day--selected');
                });
                el.classList.add('datetime-picker__day--selected');

                input.dispatchEvent(new Event('input', { bubbles: true }));
                container.style.display = 'none';
            });
        });

        // Очистить
        container.querySelector('.datetime-picker__btn--clear').addEventListener('click', (e) => {
            e.stopPropagation();
            input.value = '';
            state.selectedDate = null;
            container.style.display = 'none';
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
    }

    // ============================================
    // КАЛЕНДАРЬ ДЛЯ ДАТЫ И ВРЕМЕНИ (event_datetime)
    // ============================================

    /**
     * 🔥 Логика показа/скрытия времени кофе-брейка
     * @private
     */
    /**
     * 🔥 Логика показа/скрытия времени кофе-брейка + автоподстановка времени
     * @private
     */
    _initCoffeeBreakLogic() {
        const select = this.coffeeBreakSelect;
        const timeInput = this.coffeeBreakTimeInput;
        const timeField = timeInput.closest('.field');

        if (!timeField) return;

        // 🔥 Время по умолчанию (можно вынести в конфиг)
        const DEFAULT_TIME = this.config.coffeeBreakDefaultTime || '15:30';

        const toggleTimeField = () => {
            const isYes = select.value === 'Да';

            if (isYes) {
                // Показываем поле
                timeField.style.display = '';
                timeField.style.opacity = '0';
                requestAnimationFrame(() => {
                    timeField.style.transition = 'opacity 0.3s ease';
                    timeField.style.opacity = '1';
                });

                // 🔥 Подставляем время, если пусто
                if (!timeInput.value) {
                    timeInput.value = DEFAULT_TIME;
                }

                setTimeout(() => timeInput.focus(), 100);
            } else {
                // Скрываем поле
                timeField.style.transition = 'opacity 0.3s ease';
                timeField.style.opacity = '0';

                setTimeout(() => {
                    timeField.style.display = 'none';
                    timeField.style.opacity = '';
                    timeField.style.transition = '';

                    // 🔥 Очищаем
                    timeInput.value = '';
                    timeInput.classList.remove('is-invalid', 'is-valid');
                    const errorSpan = timeField.querySelector('.field__error');
                    if (errorSpan) errorSpan.textContent = '';
                }, 300);
            }
        };

        select.addEventListener('change', toggleTimeField);

        // 🔥 Инициализация при загрузке
        if (select.value === 'Да') {
            timeField.style.display = '';
            if (!timeInput.value) {
                timeInput.value = DEFAULT_TIME;
            }
        } else {
            timeField.style.display = 'none';
        }
    }

    _initDateTimePicker(input) {
        if (input.dataset.pickerInit) return;
        input.dataset.pickerInit = 'true';

        const wrapper = document.createElement('div');
        wrapper.className = 'datetime-picker-wrapper';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'datetime-picker-btn';
        btn.innerHTML = '📅';
        btn.setAttribute('aria-label', 'Выбрать дату и время');
        wrapper.appendChild(btn);

        const picker = document.createElement('div');
        picker.className = 'datetime-picker';
        picker.style.display = 'none';
        wrapper.appendChild(picker);

        const state = {
            viewYear: new Date().getFullYear(),
            viewMonth: new Date().getMonth(),
            selectedDate: null,
            selectedTime: null,
        };

        this._parseDateTime(input.value, state);

        const render = () => this._renderCalendar(picker, input, state, render);

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = picker.style.display === 'block';
            this._closeAllPickers();
            if (!isOpen) {
                picker.style.display = 'block';
                this._parseDateTime(input.value, state);
                render();
            }
        });

        input.addEventListener('click', (e) => {
            e.stopPropagation();
            this._closeAllPickers();
            picker.style.display = 'block';
            this._parseDateTime(input.value, state);
            render();
        });

        document.addEventListener('click', () => {
            picker.style.display = 'none';
        });

        picker.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        render();
    }

    _parseDateTime(value, state) {
        state.selectedDate = null;
        state.selectedTime = null;

        if (!value) return;

        const match = value.match(/(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
        if (match) {
            state.selectedDate = new Date(match[3], match[2] - 1, match[1]);
            state.viewYear = state.selectedDate.getFullYear();
            state.viewMonth = state.selectedDate.getMonth();

            if (match[4] && match[5]) {
                state.selectedTime = {
                    hours: match[4],
                    minutes: match[5]
                };
            }
        }
    }

    _renderCalendar(container, input, state, render) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const today = now.getDate();

        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

        const firstDay = new Date(state.viewYear, state.viewMonth, 1);
        const daysInMonth = new Date(state.viewYear, state.viewMonth + 1, 0).getDate();
        let startDay = firstDay.getDay() - 1;
        if (startDay < 0) startDay = 6;

        let html = `
            <div class="datetime-picker__header">
                <button type="button" class="datetime-picker__nav" data-action="prev">◀</button>
                <span class="datetime-picker__month">${monthNames[state.viewMonth]} ${state.viewYear}</span>
                <button type="button" class="datetime-picker__nav" data-action="next">▶</button>
            </div>
            <div class="datetime-picker__weekdays">
                ${weekDays.map(d => `<span>${d}</span>`).join('')}
            </div>
            <div class="datetime-picker__days">
        `;

        for (let i = 0; i < startDay; i++) {
            html += `<span class="datetime-picker__day datetime-picker__day--empty"></span>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === today && state.viewMonth === currentMonth && state.viewYear === currentYear;
            const isSelected = state.selectedDate &&
                day === state.selectedDate.getDate() &&
                state.viewMonth === state.selectedDate.getMonth() &&
                state.viewYear === state.selectedDate.getFullYear();
            const dateStr = `${String(day).padStart(2, '0')}.${String(state.viewMonth + 1).padStart(2, '0')}.${state.viewYear}`;

            html += `
                <span class="datetime-picker__day 
                    ${isToday ? 'datetime-picker__day--today' : ''} 
                    ${isSelected ? 'datetime-picker__day--selected' : ''}"
                    data-date="${dateStr}">
                    ${day}
                </span>
            `;
        }

        html += `</div>`;

        const timeValue = state.selectedTime
            ? `${state.selectedTime.hours}:${state.selectedTime.minutes}`
            : '';

        html += `
            <div class="datetime-picker__time">
                <label>Время:</label>
                <input type="text" class="datetime-picker__time-input" 
                       placeholder="ЧЧ:ММ" 
                       value="${timeValue}"
                       maxlength="5">
            </div>
            <div class="datetime-picker__footer">
                <button type="button" class="datetime-picker__btn datetime-picker__btn--clear">Очистить</button>
                <button type="button" class="datetime-picker__btn datetime-picker__btn--apply">Применить</button>
            </div>
        `;

        container.innerHTML = html;

        container.querySelector('[data-action="prev"]').addEventListener('click', (e) => {
            e.stopPropagation();
            state.viewMonth--;
            if (state.viewMonth < 0) { state.viewMonth = 11; state.viewYear--; }
            render();
        });

        container.querySelector('[data-action="next"]').addEventListener('click', (e) => {
            e.stopPropagation();
            state.viewMonth++;
            if (state.viewMonth > 11) { state.viewMonth = 0; state.viewYear++; }
            render();
        });

        container.querySelectorAll('.datetime-picker__day[data-date]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const dateStr = el.dataset.date;
                const timeInput = container.querySelector('.datetime-picker__time-input');

                const timeVal = timeInput ? timeInput.value : '';
                if (timeVal && timeVal.match(/^\d{2}:\d{2}$/)) {
                    state.selectedTime = {
                        hours: timeVal.substring(0, 2),
                        minutes: timeVal.substring(3, 5)
                    };
                }

                state.selectedDate = new Date(dateStr.split('.').reverse().join('-'));

                const finalTime = state.selectedTime
                    ? `${state.selectedTime.hours}:${state.selectedTime.minutes}`
                    : '';
                input.value = finalTime ? `${dateStr} ${finalTime}` : dateStr;

                container.querySelectorAll('.datetime-picker__day').forEach(d => {
                    d.classList.remove('datetime-picker__day--selected');
                });
                el.classList.add('datetime-picker__day--selected');

                input.dispatchEvent(new Event('input', { bubbles: true }));
            });
        });

        const timeInput = container.querySelector('.datetime-picker__time-input');
        if (timeInput) {
            timeInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 4) value = value.substring(0, 4);
                let formatted = '';
                for (let i = 0; i < value.length; i++) {
                    if (i === 2) formatted += ':';
                    formatted += value[i];
                }
                e.target.value = formatted;
            });

            timeInput.addEventListener('change', (e) => {
                const val = e.target.value;
                if (val && val.match(/^\d{2}:\d{2}$/)) {
                    state.selectedTime = {
                        hours: val.substring(0, 2),
                        minutes: val.substring(3, 5)
                    };

                    if (state.selectedDate) {
                        const dateStr = `${String(state.selectedDate.getDate()).padStart(2, '0')}.${String(state.selectedDate.getMonth() + 1).padStart(2, '0')}.${state.selectedDate.getFullYear()}`;
                        input.value = `${dateStr} ${val}`;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
            });

            timeInput.addEventListener('click', (e) => e.stopPropagation());
        }

        container.querySelector('.datetime-picker__btn--apply').addEventListener('click', (e) => {
            e.stopPropagation();

            const timeVal = timeInput ? timeInput.value : '';
            if (timeVal && timeVal.match(/^\d{2}:\d{2}$/)) {
                state.selectedTime = {
                    hours: timeVal.substring(0, 2),
                    minutes: timeVal.substring(3, 5)
                };
            }

            if (state.selectedDate) {
                const dateStr = `${String(state.selectedDate.getDate()).padStart(2, '0')}.${String(state.selectedDate.getMonth() + 1).padStart(2, '0')}.${state.selectedDate.getFullYear()}`;
                const finalTime = state.selectedTime
                    ? `${state.selectedTime.hours}:${state.selectedTime.minutes}`
                    : '';
                input.value = finalTime ? `${dateStr} ${finalTime}` : dateStr;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }

            container.style.display = 'none';
        });

        container.querySelector('.datetime-picker__btn--clear').addEventListener('click', (e) => {
            e.stopPropagation();
            input.value = '';
            state.selectedDate = null;
            state.selectedTime = null;
            container.style.display = 'none';
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
    }

    _closeAllPickers() {
        document.querySelectorAll('.datetime-picker').forEach(p => {
            p.style.display = 'none';
        });
    }

    // ============================================
    // МАСКА ДАТЫ (ДД.ММ.ГГГГ)
    // ============================================

    _dateMask(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 8) value = value.substring(0, 8);

        let formatted = '';
        for (let i = 0; i < value.length; i++) {
            if (i === 2 || i === 4) formatted += '.';
            formatted += value[i];
        }
        input.value = formatted;
    }

    getState() {
        return {
            isInitialized: this.isInitialized,
            hasForm: !!this.form,
        };
    }

    destroy() {
        if (!this.isInitialized) return;
        this.isInitialized = false;
        console.log('🔄 FormRetail destroyed');
    }
}

// В FormRetail.js или отдельном скрипте
document.addEventListener('formit:error', function(e) {
    const form = document.getElementById('formRetail');
    if (!form) return;

    // 🔥 Для каждого поля с ошибкой — добавляем is-invalid
    const errorSpans = form.querySelectorAll('[data-formit-error]');

    errorSpans.forEach(span => {
        const fieldName = span.dataset.formitError;
        const errorText = span.textContent.trim();

        if (!errorText) return;

        // Находим поле по имени
        let input = form.querySelector(`[name="${fieldName}"]`);

        // Если поле — массив (book_author[], tech_tv[] и т.д.)
        if (!input) {
            input = form.querySelector(`[name="${fieldName}[]"]`);
        }

        if (input) {
            input.classList.add('is-invalid');
        }
    });
});

// 🔥 При вводе — убираем ошибку
document.addEventListener('input', function(e) {
    const input = e.target;

    if (input.classList.contains('is-invalid')) {
        input.classList.remove('is-invalid');

        // Скрываем сообщение об ошибке
        const field = input.closest('.field');
        if (field) {
            const errorSpan = field.querySelector('[data-formit-error]');
            if (errorSpan) errorSpan.textContent = '';
        }
    }
});