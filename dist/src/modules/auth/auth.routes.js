"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const authenticate_middleware_js_1 = __importDefault(require("../../middlewares/authenticate.middleware.js"));
const auth_controller_js_1 = __importDefault(require("./auth.controller.js"));
const images_upload_js_1 = require("../../lib/utils/images-upload.js");
const authorize_middleware_js_1 = __importDefault(require("../../middlewares/authorize.middleware.js"));
const roles_js_1 = require("../../lib/constants/roles.js");
exports.authRouter = (0, express_1.Router)();
const authHandlers = new auth_controller_js_1.default();
const imageUpload = new images_upload_js_1.ImageUpload("photo", "user", "public/images/users", [500, 500]);
exports.authRouter.post("/signup", imageUpload.handleUpload, imageUpload.optimizeUpload, authHandlers.signup);
exports.authRouter.post("/login", authHandlers.login);
exports.authRouter.get("/login/token", authHandlers.loginWithToken);
exports.authRouter.use(authenticate_middleware_js_1.default);
exports.authRouter.get("/logout", authHandlers.logout);
exports.authRouter.patch("/updatePassword", (0, authorize_middleware_js_1.default)(roles_js_1.ROLE.MANAGER, roles_js_1.ROLE.MODERATOR), authHandlers.updatePassword);
exports.authRouter.patch("/updateMe", (0, authorize_middleware_js_1.default)(roles_js_1.ROLE.MANAGER, roles_js_1.ROLE.MODERATOR), imageUpload.handleUpload, imageUpload.optimizeUpload, authHandlers.updateMe);
