export default class CookieNotice {
    constructor() {
        this.notice = document.getElementById('cookie-notice');
        if (!this.notice) return;

        // 🔥 Проверяем, делал ли пользователь выбор (любой: принял или отклонил)
        const userChoice = this.getCookie('cookie_choice');

        if (userChoice === 'accepted' || userChoice === 'declined') {
            this.notice.remove();
            return;
        }

        this.acceptBtn = document.getElementById('cookie-accept');
        this.declineBtn = document.getElementById('cookie-decline');
        this.bindEvents();
    }

    bindEvents() {
        if (this.acceptBtn) {
            this.acceptBtn.addEventListener('click', () => {
                this.setCookie('cookie_choice', 'accepted', 365);
                this.notice.remove();

                // 🔥 Здесь можно инициализировать аналитику (Яндекс.Метрика, Google Analytics)
                // console.log('Аналитика включена');
            });
        }

        if (this.declineBtn) {
            this.declineBtn.addEventListener('click', () => {
                this.setCookie('cookie_choice', 'declined', 365);
                this.notice.remove();

                // 🔥 Здесь можно отключить аналитику, если она была загружена
                // console.log('Аналитика отключена');
            });
        }
    }

    setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i=0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
}