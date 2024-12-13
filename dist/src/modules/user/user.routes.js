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
const authorize_middleware_js_1 = __importDefault(require("../../middlewares/authorize.middleware.js"));
const roles_js_1 = require("../../lib/constants/roles.js");
exports.userRouter = (0, express_1.Router)();
const userHandlers = new user_controller_js_1.default();
const imageUpload = new images_upload_js_1.ImageUpload("photo", "user", "public/images/users", [500, 500]);
exports.userRouter.use(authenticate_middleware_js_1.default);
exports.userRouter
    .route("/")
    .get((0, authorize_middleware_js_1.default)(roles_js_1.ROLE.MANAGER, roles_js_1.ROLE.MODERATOR, roles_js_1.ROLE.TEACHER), userHandlers.getUsers)
    .post((0, authorize_middleware_js_1.default)(roles_js_1.ROLE.MANAGER, roles_js_1.ROLE.MODERATOR), imageUpload.handleUpload, imageUpload.optimizeUpload, handle_roles_hierarchy_middleware_js_1.handleRolesHierarchy, userHandlers.createUser);
exports.userRouter
    .route("/:id")
    .get((0, authorize_middleware_js_1.default)(roles_js_1.ROLE.MANAGER, roles_js_1.ROLE.MODERATOR, roles_js_1.ROLE.TEACHER), userHandlers.getUser)
    .patch((0, authorize_middleware_js_1.default)(roles_js_1.ROLE.MANAGER, roles_js_1.ROLE.MODERATOR, roles_js_1.ROLE.TEACHER), imageUpload.handleUpload, imageUpload.optimizeUpload, handle_roles_hierarchy_middleware_js_1.handleRolesHierarchy, userHandlers.updateUser)
    .delete((0, authorize_middleware_js_1.default)(roles_js_1.ROLE.MANAGER, roles_js_1.ROLE.MODERATOR), handle_roles_hierarchy_middleware_js_1.handleRolesHierarchy, userHandlers.deleteUser);
