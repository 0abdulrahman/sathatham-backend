"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = errorHandlingMiddleware;
const appError_js_1 = __importDefault(require("../lib/utils/appError.js"));
const cloneError_js_1 = __importDefault(require("../lib/utils/cloneError.js"));
/**
 * Sends the full error object in the response during development mode.
 * It includes the error status, message, error object, and stack trace.
 *
 * @param {AppError} err - The application error object.
 * @param {Response} res - The Express response object.
 */
const sendErrorDevelopment = (err, res) => {
    const errors = err.message.includes('errorMessage') ? JSON.parse(err.message) : err.message;
    console.error('❌ ERROR: ', err);
    res.status(err.statusCode).json({
        status: err.status,
        statusCode: err.statusCode,
        message: errors,
        error: err,
        stack: err.stack,
    });
};
/**
 * Sends a specific error response in production mode to avoid leaking sensitive data.
 * If the error is operational, it sends minimal error details (status and message).
 * For non-operational errors, it logs the error and sends a generic error response.
 *
 * @param {AppError} err - The application error object.
 * @param {Response} res - The Express response object.
 */
const sendErrorProduction = (err, res) => {
    const errors = err.message.includes('errorMessage') ? JSON.parse(err.message) : err.message;
    if (err.isOperational) {
        // Operational error: Send minimal error details
        res.status(err.statusCode).json({
            status: err.status,
            statusCode: err.statusCode,
            message: errors,
        });
    }
    else {
        // Non-operational error: Log the error and send a generic error response
        console.error('❌ ERROR: ', err);
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'Something went wrong.',
        });
    }
};
/**
 * Global error handling middleware for Express applications.
 * This middleware captures errors, sets the appropriate status code and status,
 * and sends a JSON response with the error details.
 * This middleware has to have 4 paramters in order for Express to recognize it's the an error-handling middleware
 *
 * @param {AppError} err - The error object, which should be an instance of AppError.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 */
function errorHandlingMiddleware(err, req, res, next) {
    var _a;
    // Add defaults to statusCode and status
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    // If we're in developement, send the full error details.
    if (process.env.NODE_ENV === 'development')
        sendErrorDevelopment(err, res);
    // If we're in production, check on the error name to provide meaningful message accordingly...
    else {
        // Reset the error type to be able to give it another type.
        let error = (0, cloneError_js_1.default)(err);
        // If it's a CastError, that likely means the user requested a data with an invalid `:id` for the param (eg: /:id).
        if (err.name === 'CastError') {
            error = new appError_js_1.default(`The value [${error.value}] is invalid for [${error.path}]`, 400);
        }
        // If it's a ValidationError, that means one or more fields don't meet the database validation schema.
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map((err) => err.message);
            error = new appError_js_1.default(`Invalid input data: \n- ${errors.join('\n- ')}`, 400);
        }
        // If it's an error with a code of 11000, that means it's a MongoDB error (not Mongoose)
        // and it probably means the user has entered a field value that already exists in the DB in another document.
        if (err.code === 11000) {
            // Get the field value that's inside double quotes "",
            // or keys inside the keyValue property in the error object,
            // or just use the 'one or more value' as a key and display it
            const value = ((_a = err.errmsg.match(/"([^"]*)"/g)) === null || _a === void 0 ? void 0 : _a[0]) ||
                Object.keys((err === null || err === void 0 ? void 0 : err.keyValue) || { 'one or more value': null }).join(' - ');
            error = new appError_js_1.default(`Duplicate field value for (${value}). Please use another value!`, 400);
        }
        // If it's a JsonWebToken error, it's an error for an invalid token
        if (err.name === 'JsonWebTokenError')
            error = new appError_js_1.default('Invalid token, please login again!', 401);
        // If it's a TokenExpiredError error, it's an error for an expired token
        if (err.name === 'TokenExpiredError')
            error = new appError_js_1.default('Your token has expired, please login again!', 401);
        // If the error message starts with 'SAVE_FILE', it's related to saving the file from cache
        if (err.message.startsWith('[SAVE_FILE]'))
            error = new appError_js_1.default(err.message, 400);
        // If the error code is ENOENT, it's an error related to fs functions, probably upon deleting an item
        if (err.code === 'ENOENT')
            error = new appError_js_1.default("Deletion failed! Couldn't locate the file in the server.", 500);
        sendErrorProduction(error, res);
    }
}
