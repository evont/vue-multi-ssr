"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../common/index"));
const storage_1 = require("./storage");
const api_1 = __importDefault(require("./api"));
class Kit extends index_1.default {
    constructor() {
        super();
        this.Cookie = storage_1.cookies;
        this.Api = new api_1.default();
        this.env = {
            //@ts-ignore
            userAgent: navigator.userAgent
        };
    }
}
exports.default = Kit;
