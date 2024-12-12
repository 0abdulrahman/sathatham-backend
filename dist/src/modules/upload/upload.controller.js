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
exports.uploadMultipleFiles = exports.uploadFile = void 0;
const node_schedule_1 = __importDefault(require("node-schedule"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const rest_api_response_js_1 = require("../../lib/utils/rest-api-response.js");
const catch_async_js_1 = __importDefault(require("../../lib/utils/catch-async.js"));
const app_error_js_1 = __importDefault(require("../../lib/utils/app-error.js"));
const get_path_name_js_1 = __importDefault(require("../../lib/utils/get-path-name.js"));
exports.uploadFile = (0, catch_async_js_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    if (!file) {
        return next(new app_error_js_1.default("No file uploaded", 400));
    }
    // Store the file info in the cache with a 10-minute expiry
    const expiryDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    // Schedule file deletion after 10 minutes if not used
    node_schedule_1.default.scheduleJob(expiryDate, () => __awaiter(void 0, void 0, void 0, function* () {
        const cacheDir = yield (0, get_path_name_js_1.default)("", "public/cache");
        const filePath = path_1.default.join(cacheDir, file.filename);
        const fileExists = yield fs_extra_1.default.pathExists(filePath);
        if (fileExists)
            yield fs_extra_1.default.unlink(filePath);
    }));
    // Return the file name in the response
    rest_api_response_js_1.RESTResponse.success({ file: file.filename }, res);
}));
exports.uploadMultipleFiles = (0, catch_async_js_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files;
    if (!files || (Array.isArray(files) && files.length === 0)) {
        return next(new app_error_js_1.default("No files uploaded", 400));
    }
    // Store the file info in the cache with a 10-minute expiry
    const expiryDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const filesNames = [];
    // Convert req.files to { fieldName: File[] }
    const fileGroups = req.files;
    for (const fieldName of Object.keys(fileGroups)) {
        const fileGroup = fileGroups[fieldName];
        for (const file of fileGroup) {
            filesNames.push(file.filename);
            // Schedule file deletion after 10 minutes if not used
            node_schedule_1.default.scheduleJob(expiryDate, () => __awaiter(void 0, void 0, void 0, function* () {
                const cacheDir = yield (0, get_path_name_js_1.default)("", "public/cache");
                const filePath = path_1.default.join(cacheDir, file.filename);
                const fileExists = yield fs_extra_1.default.pathExists(filePath);
                if (fileExists)
                    yield fs_extra_1.default.unlink(filePath);
            }));
        }
    }
    // Return the file names in the response
    rest_api_response_js_1.RESTResponse.success({ files: filesNames }, res);
}));
