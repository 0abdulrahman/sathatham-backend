"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_error_js_1 = __importDefault(require("../lib/utils/app-error.js"));
/**
 * A middleware to check if the user is authorized to have access or perform a certain action based on his role
 * @param {ROLE[]} roles An array of rules which are allowed to have access
 */
// This middleware is wrapped inside another function that receives the `roles` argument because middlewares cannot receive custom arguments,
// thus we had to wrap it inside a function that returns the middleware itself in order to receive custom arguments into the wrapper.
const authorize = (...roles) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!roles.includes(req.user.role)) {
        return next(new app_error_js_1.default("You do not have permission to perform this action!", 401));
    }
    else {
        next();
    }
});
exports.default = authorize;
