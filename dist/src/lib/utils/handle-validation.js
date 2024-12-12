"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handleValidation;
const app_error_js_1 = __importDefault(require("./app-error.js"));
/**
 * Handles validation errors by converting them into a JSON string and throwing an AppError.
 * If no errors, returns the validated data.
 * @template T - The expected type of the validation error.
 * @template E - The expected type of the valid data.
 * @param {SafeParseReturnType<T, E>} validationResult - The result of a Zod schema validation.
 * @returns {E} - The validated data if validation succeeds.
 * @throws {AppError} - Throws an AppError with validation error details and a 400 status code if validation fails.
 */
function handleValidation(validationResult) {
    if (validationResult.success) {
        return validationResult.data;
    }
    else {
        const errors = JSON.stringify(validationResult.error.issues.map((issue) => ({
            field: issue.path[0],
            errorMessage: issue.message,
        })));
        throw new app_error_js_1.default(errors, 400);
    }
}
