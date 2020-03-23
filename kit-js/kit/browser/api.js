"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const api_1 = __importStar(require("../common/api"));
class Api extends api_1.default {
    constructor() {
        super();
        api_1.methods.forEach(item => {
            const method = item.toLowerCase();
            this[method] = function (url, params) {
                return axios_1.default({
                    method,
                    url,
                    params
                }).then(res => res.data);
            };
        });
    }
}
exports.default = Api;
