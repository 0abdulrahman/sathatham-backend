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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const util_1 = require("util");
const user_schema_js_1 = require("../../lib/schemes/user.schema.js");
const catch_async_js_1 = __importDefault(require("../../lib/utils/catch-async.js"));
const handle_validation_js_1 = __importDefault(require("../../lib/utils/handle-validation.js"));
const app_error_js_1 = __importDefault(require("../../lib/utils/app-error.js"));
const user_model_js_1 = require("../../../database/models/user.model.js");
const generateAndSendToken = (user, statusCode, req, res) => {
    const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: `${process.env.JWT_EXPIRATION_TIME}d`,
    });
    // Set the token in the cookies as HTTP only that expires in 7 days
    const cookieOptions = {
        expires: new Date(Date.now() + Number(process.env.JWT_EXPIRATION_TIME) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        // If we're in production, only send the cookie in a secured connection (https)
        // secure: req.secure,
    };
    // Only save the token in cookies if the rememberMe is set to true
    if (req.body.rememberMe)
        res.cookie("token", token, cookieOptions);
    res.status(statusCode).json({ status: "success", statusCode, data: { token, user } });
};
class AuthHandlers {
    constructor() {
        this.signup = (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const candidate = (0, handle_validation_js_1.default)(user_schema_js_1.UserSchema.omit({ role: true }).safeParse(req.body));
            if (candidate.password !== candidate.passwordConfirm) {
                // Validation might pass but passwords are not the same, so check first
                return next(new app_error_js_1.default("Passwords don't match!", 400));
            }
            // Only add the photo if it exists so that it doesn't overrides the default photo with blank one
            if (req.file)
                candidate.photo = req.file.filename;
            // Create the user
            const newUser = yield user_model_js_1.User.create(candidate);
            // Remove the password from the user document before sending it
            newUser.password = undefined;
            // Create a JWT token to send it to the client
            generateAndSendToken(newUser, 201, req, res);
        }));
        this.login = (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const candidate = req.body;
            // Return a 400 response if any of both login fields is missing
            if (!candidate.username || !candidate.password) {
                return next(new app_error_js_1.default("Username and password are required!", 400));
            }
            // Check if there's a user with the received username
            const user = yield user_model_js_1.User.findOne({ username: candidate.username }).select("+password -wishlist");
            // If there's no user, or the password is incorrect return a 401 response
            if (!user || !(yield bcrypt_1.default.compare(candidate.password, user.password)))
                return next(new app_error_js_1.default("Incorrect username or password!", 401));
            // Delete the password field before sending the user object to the client
            user.password = undefined;
            // Generate a new token for every successful login attempt
            generateAndSendToken(user, 200, req, res);
        }));
        this.loginWithToken = (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const tokenCookie = req.cookies["token"];
            // - Check if the token exists
            if (!tokenCookie)
                return next(new app_error_js_1.default("You are not logged in, please log in to have access!", 401));
            // - Verify the token
            const decodedToken = yield (0, util_1.promisify)(jsonwebtoken_1.default.verify)(tokenCookie, process.env.JWT_SECRET);
            // - Check if the user still exists in the DB, because maybe the user has been deleted but his token hasn't expired yet!
            const user = yield user_model_js_1.User.findById(decodedToken.id, { wishlist: 0 });
            if (!user)
                return next(new app_error_js_1.default("This token belongs to a user that no longer exists!", 401));
            // - Check if the user has changed their password AFTER the token was issued, if they did that means this token should not be valid
            //   and we have to prevent anyone from accessing the app with this old token
            if (user.passwordChangedAfterToken(new Date(decodedToken.iat * 1000))) {
                // => Multiply the issue date by 1000 because it's in seconds not milliseconds.
                return next(new app_error_js_1.default("User recently changed their password, please login again!", 401));
            }
            res.status(200).json({ status: "success", statusCode: 200, data: { token: tokenCookie, user } });
        }));
        this.logout = (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            res.clearCookie("token").status(200).json({ status: "success", statusCode: 200, message: "Logged out successfully!" });
        }));
    }
}
exports.default = AuthHandlers;
