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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const util_1 = require("util");
const catch_async_js_1 = __importDefault(require("../lib/utils/catch-async.js"));
const app_error_js_1 = __importDefault(require("../lib/utils/app-error.js"));
const user_model_js_1 = require("../../database/models/user.model.js");
/**
 * A middleware to authenticate the user based on JWT token.
 * @param {RequestType} req - Extended Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
const authenticate = (0, catch_async_js_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenHeader = req.headers.authorization;
    // - Check if the token exists
    if (!(tokenHeader === null || tokenHeader === void 0 ? void 0 : tokenHeader.startsWith("Bearer")))
        return next(new app_error_js_1.default("You are not logged in, please log in to have access!", 401));
    // - Split the token header to get only the token without `Bearer`
    const token = tokenHeader.split(" ")[1];
    // - Verify the token
    const decodedToken = yield (0, util_1.promisify)(jsonwebtoken_1.default.verify)(token, process.env.JWT_SECRET);
    // - Check if the user still exists in the DB, because maybe the user has been deleted but his token hasn't expired yet!
    const user = yield user_model_js_1.User.findById(decodedToken.id);
    if (!user)
        return next(new app_error_js_1.default("This token belongs to a user that no longer exists!", 401));
    // - Check if the user has changed their password AFTER the token was issued, if they did that means this token should not be valid
    //   and we have to prevent anyone from accessing the app with this old token
    if (user.passwordChangedAfterToken(new Date(decodedToken.iat * 1000))) {
        // => Multiply the issue date by 1000 because it's in seconds not milliseconds.
        return next(new app_error_js_1.default("User recently changed their password, please login again!", 401));
    }
    // - Else if everything's fine, add the user id in the request. We'll need it later in next middlewares.
    req.user = user;
    // - Grant access to the protected-route
    return next();
}));
exports.default = authenticate;
