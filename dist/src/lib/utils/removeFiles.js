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
 * Removes specified files from the server.
 *
 * @param {string[]} fileNames - The names of the files to be removed.
 * @param {string} filePath - The base path where files are stored.
 */
const removeFiles = (fileNames, filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const removalPromises = fileNames.map((url) => __awaiter(void 0, void 0, void 0, function* () {
        // Get the file name by splitting its url and get the last element
        // ex: /../../element-name.extension
        const path = yield (0, get_path_name_js_1.default)(url.split("/").reverse()[0], filePath);
        return unlinkAsync(path);
    }));
    yield Promise.all(removalPromises);
});
exports.default = removeFiles;
