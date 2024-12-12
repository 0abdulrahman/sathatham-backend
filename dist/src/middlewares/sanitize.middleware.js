"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sanitize;
const dompurify_1 = __importDefault(require("dompurify"));
const jsdom_1 = require("jsdom");
const window = new jsdom_1.JSDOM("").window;
const DOMPurify = (0, dompurify_1.default)(window);
/**
 * Middleware to sanitize request body to prevent XSS attacks.
 *
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The outgoing response object.
 * @param {NextFunction} next - The next middleware function.
 */
function sanitize(req, res, next) {
    // Recursively sanitize all string properties of an object.
    const sanitizeObject = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] === "string") {
                obj[key] = DOMPurify.sanitize(obj[key]);
            }
            else if (typeof obj[key] === "object" && obj[key] !== null) {
                sanitizeObject(obj[key]);
            }
        }
    };
    sanitizeObject(req.body);
    next();
}
