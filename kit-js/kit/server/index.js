"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../common/index"));
const api_1 = __importDefault(require("./api"));
class Kit extends index_1.default {
    constructor(context) {
        super();
        const Cookie = {
            set(name, value, option = {}) {
                context.cookies.set(name, value, Object.assign({}, {
                    httpOnly: false,
                    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    secure: false
                }, option));
            },
            get(name) {
                return context.cookies.get(name);
            },
            remove(name) {
                context.cookies.set(name, '', {
                    expires: Date.now() - 1 * 24 * 60 * 60 * 1000
                });
            }
        };
        this.env = {
            userAgent: context ? context.headers['user-agent'] : ''
        };
        this.Cookie = Cookie;
        const api = new api_1.default({ context });
        this.Api = api;
    }
}
exports.default = Kit;
