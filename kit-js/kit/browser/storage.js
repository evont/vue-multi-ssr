"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookies = {
    set(name, value, options = {}) {
        const { expires, domain } = options;
        const date = new Date();
        date.setTime(expires || Date.now() + 24 * 60 * 60 * 1000);
        const cookie = `${name}=${name === 'token' ? value : escape(value)};expires=${date.toUTCString()};path=/; domain=${domain}`;
        document.cookie = cookie;
        return this;
    },
    get(name) {
        const cookies = document.cookie.split('; ');
        let temp;
        for (let i = 0, len = cookies.length; i < len; i++) {
            temp = cookies[i].split('=');
            if (name === temp[0]) {
                temp.shift();
                return unescape(temp.join('='));
            }
        }
        return '';
    },
    remove(name) {
        exports.cookies.set(name, '', {
            expires: Date.now() - 24 * 60 * 60 * 1000
        });
    }
};
