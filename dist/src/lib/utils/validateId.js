"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = validateId;
const mongoose_1 = require("mongoose");
const app_error_js_1 = __importDefault(require("./app-error.js"));
function validateId(id) {
    if (!(0, mongoose_1.isValidObjectId)(id))
        throw new app_error_js_1.default("Invalid id specified, please make sure it's a valid id!", 400);
}
