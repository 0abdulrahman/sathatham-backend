"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRouter = void 0;
const express_1 = require("express");
const post_controller_1 = __importDefault(require("./post.controller"));
const authenticate_middleware_1 = __importDefault(require("../../middlewares/authenticate.middleware"));
const authorize_middleware_1 = __importDefault(require("../../middlewares/authorize.middleware"));
const roles_1 = require("../../lib/constants/roles");
exports.postRouter = (0, express_1.Router)();
const postHandlers = new post_controller_1.default();
exports.postRouter.get("/", postHandlers.getPosts);
exports.postRouter.get("/:id", postHandlers.getPost);
exports.postRouter.use(authenticate_middleware_1.default, (0, authorize_middleware_1.default)(roles_1.ROLE.MANAGER, roles_1.ROLE.MODERATOR));
exports.postRouter.post("/", postHandlers.createPost);
exports.postRouter.route("/:id").patch(postHandlers.updatePost).delete(postHandlers.deletePost);
