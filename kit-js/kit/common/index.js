"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Kit {
    constructor() {
        this.Toast = {
            show() {
                return '';
            },
            success() {
                return '';
            },
            error() {
                return '';
            },
            loading() {
                return '';
            },
            hide() { }
        };
        this.Modal = {
            confirm() { },
            alert() { }
        };
    }
}
exports.default = Kit;
