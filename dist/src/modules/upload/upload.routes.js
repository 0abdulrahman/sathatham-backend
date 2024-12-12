"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = require("express");
const multer_setup_js_1 = require("./multer-setup.js");
const upload_controller_js_1 = require("./upload.controller.js");
const authenticate_middleware_js_1 = __importDefault(require("../../middlewares/authenticate.middleware.js"));
exports.uploadRouter = (0, express_1.Router)();
exports.uploadRouter.post("/single", authenticate_middleware_js_1.default, multer_setup_js_1.upload.single("file"), upload_controller_js_1.uploadFile);
exports.uploadRouter.post("/multiple", authenticate_middleware_js_1.default, multer_setup_js_1.upload.fields([{ name: "files" }]), upload_controller_js_1.uploadMultipleFiles);
