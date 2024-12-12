"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_controller_js_1 = __importDefault(require("./user.controller.js"));
const authenticate_middleware_js_1 = __importDefault(require("../../middlewares/authenticate.middleware.js"));
const images_upload_js_1 = require("../../lib/utils/images-upload.js");
const handle_roles_hierarchy_middleware_js_1 = require("../../middlewares/handle-roles-hierarchy.middleware.js");
exports.userRouter = (0, express_1.Router)();
const userHandlers = new user_controller_js_1.default();
const imageUpload = new images_upload_js_1.ImageUpload("photo", "user", "public/images/users", [500, 500]);
exports.userRouter.use(authenticate_middleware_js_1.default);
exports.userRouter
    .route("/")
    .get(userHandlers.getUsers)
    .post(imageUpload.handleUpload, imageUpload.optimizeUpload, handle_roles_hierarchy_middleware_js_1.handleRolesHierarchy, userHandlers.createUser);
exports.userRouter
    .route("/:id")
    .get(userHandlers.getUser)
    .patch(imageUpload.handleUpload, imageUpload.optimizeUpload, handle_roles_hierarchy_middleware_js_1.handleRolesHierarchy, userHandlers.updateUser)
    .delete(handle_roles_hierarchy_middleware_js_1.handleRolesHierarchy, userHandlers.deleteUser);
