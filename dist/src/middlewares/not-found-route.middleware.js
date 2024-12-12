"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const app_error_js_1 = __importDefault(require("../lib/utils/app-error.js"));
/**
 * Middleware to handle not found routes in an Express application.
 * This middleware creates an AppError for routes that do not exist and
 * forwards it to the global error handling middleware.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 */
function default_1(req, res, next) {
    const err = new app_error_js_1.default(`The route ${req.originalUrl} you requested does not exist on the server.`, 404);
    // Forward the error to the global error-handling middleware by calling `next` with an argument which is the error.
    next(err);
}
