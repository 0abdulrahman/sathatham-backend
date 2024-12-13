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
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const util_1 = require("util");
const user_schema_js_1 = require("../../lib/schemes/user.schema.js");
const catch_async_js_1 = __importDefault(require("../../lib/utils/catch-async.js"));
const app_error_js_1 = __importDefault(require("../../lib/utils/app-error.js"));
const user_model_js_1 = require("../../../database/models/user.model.js");
const rest_api_response_js_1 = require("../../lib/utils/rest-api-response.js");
const handle_validation_js_1 = __importDefault(require("../../lib/utils/handle-validation.js"));
const zod_1 = require("zod");
const roles_js_1 = require("../../lib/constants/roles.js");
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
            if (candidate.studentData) {
                // Remove any field that is not allowed for a student to fill
                candidate.studentData.approved = false;
                delete candidate.studentData.GPA;
                delete candidate.studentData.report;
            }
            // Only add the photo if it exists so that it doesn't overrides the default photo with blank one
            if (req.file)
                candidate.photo = req.file.filename;
            // Create the user
            const newUser = yield user_model_js_1.User.create(candidate);
            // Remove the password from the user document before sending it back to the client
            newUser.password = undefined;
            // Create a JWT token to send it to the client
            generateAndSendToken(newUser, 201, req, res);
        }));
        this.login = (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const candidate = req.body;
            // Return a 400 response if any of both login fields is missing
            if (!candidate.username || !candidate.password) {
                return next(new app_error_js_1.default("Username and password are required!", 400));
            }
            // Check if there's a user with the received username
            const user = yield user_model_js_1.User.findOne({ username: candidate.username }).select("+password");
            // If there's no user, or the password is incorrect return a 401 response
            if (!user || !(yield bcrypt_1.default.compare(candidate.password, user.password)))
                return next(new app_error_js_1.default("Incorrect username or password!", 401));
            // Prevent student from logging in if their registration is yet to be accepted
            if (user.role === roles_js_1.ROLE.STUDENT && ((_a = user.studentData) === null || _a === void 0 ? void 0 : _a.approved) === false) {
                return next(new app_error_js_1.default("Incorrect username or password!", 401));
            }
            // Delete the password field before sending the user object to the client
            user.password = undefined;
            // Generate a new token for every successful login attempt
            generateAndSendToken(user, 200, req, res);
        }));
        this.loginWithToken = (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const tokenCookie = req.cookies["token"];
            // - Check if the token exists
            if (!tokenCookie)
                return next(new app_error_js_1.default("You are not logged in, please log in to have access!", 401));
            // - Verify the token
            const decodedToken = yield (0, util_1.promisify)(jsonwebtoken_1.default.verify)(tokenCookie, process.env.JWT_SECRET);
            // - Check if the user still exists in the DB, because maybe the user has been deleted but his token hasn't expired yet!
            const user = yield user_model_js_1.User.findById(decodedToken.id);
            if (!user)
                return next(new app_error_js_1.default("This token belongs to a user that no longer exists!", 401));
            // Prevent student from logging in if their registration is yet to be accepted
            if (user.role === roles_js_1.ROLE.STUDENT && ((_a = user.studentData) === null || _a === void 0 ? void 0 : _a.approved) === false) {
                return next(new app_error_js_1.default("Incorrect username or password!", 401));
            }
            rest_api_response_js_1.RESTResponse.success({ token: tokenCookie, user }, express_1.response);
        }));
        this.logout = (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            res.clearCookie("token").status(200).json({ status: "success", statusCode: 200, message: "Logged out successfully!" });
        }));
        this.updatePassword = (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const data = (0, handle_validation_js_1.default)(user_schema_js_1.UserSchema.pick({ password: true, passwordConfirm: true })
                .extend({
                currentPassword: zod_1.z.string({ required_error: "Current password is required!" }),
            })
                .safeParse(req.body));
            if (data.password !== data.passwordConfirm) {
                // Validation might pass but passwords are not the same, so check first
                return next(new app_error_js_1.default("Passwords don't match!", 400));
            }
            // Get the user from the DB
            const user = (yield user_model_js_1.User.findById({ _id: req.user._id }).select("+password"));
            // Check if the current password matches the one in the DB after decryption
            const correctPassword = yield bcrypt_1.default.compare(data.currentPassword, user.password);
            if (!correctPassword)
                return next(new app_error_js_1.default("Your current password is incorrect!", 401));
            // If everything is correct, update the user document
            user.password = data.password;
            user.passwordConfirm = data.passwordConfirm;
            yield user.save();
            // Generate and send a new token
            generateAndSendToken(user, 200, req, res);
        }));
        this.updateMe = (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const data = (0, handle_validation_js_1.default)(user_schema_js_1.UserSchema.pick({ firstName: true, familyName: true })
                .extend({
                password: zod_1.z.void({ message: "You cannot use this endpoint to update your password" }),
                photo: zod_1.z.string(),
            })
                .partial()
                .safeParse(req.body));
            // Only add the photo if it exists so that it doesn't overrides the current photo with blank one
            if (req.file)
                data.photo = req.file.filename;
            // Update the user
            const user = yield user_model_js_1.User.findByIdAndUpdate(req.user._id, data, {
                new: true,
                runValidators: true,
            });
            res.status(200).json({ status: "success", statusCode: 200, data: { user } });
        }));
    }
}
exports.default = AuthHandlers;
