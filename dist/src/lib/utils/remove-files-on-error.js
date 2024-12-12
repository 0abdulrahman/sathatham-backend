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
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const get_path_name_js_1 = __importDefault(require("./get-path-name.js"));
const unlinkAsync = (0, util_1.promisify)(fs_1.default.unlink);
/**
 * Removes files from the server if the request fails.
 *
 * @param {Request} req        - The Express request object.
 * @param {NextFunction} next  - The Express next middleware function.
 * @returns {Promise<void>}    A promise that resolves when all files have been removed.
 */
const removeFilesWhenError = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // If the request had a file, delete it upon fail
    if (req.file) {
        const filenameSegments = req.file.filename.split("/");
        const filename = filenameSegments[filenameSegments.length - 1];
        const filePath = yield (0, get_path_name_js_1.default)(filename, req.file.destination);
        yield unlinkAsync(filePath);
    }
    // If the request has multiple files, delete all of them
    if (req.files && Object.keys(req.files).length > 0) {
        const removalPromises = [];
        Object.keys(req.files).forEach((fieldName) => {
            const files = req.files[fieldName];
            files.forEach((file) => {
                const filenameSegments = file.filename.split("/");
                const filename = filenameSegments[filenameSegments.length - 1];
                const removalPromise = (0, get_path_name_js_1.default)(filename, file.destination)
                    .then((path) => unlinkAsync(path))
                    .catch((err) => next(err));
                removalPromises.push(removalPromise);
            });
        });
        yield Promise.all(removalPromises);
    }
});
exports.default = removeFilesWhenError;
