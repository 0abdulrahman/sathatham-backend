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
exports.default = getPathName;
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
/**
 * Constructs the absolute file path based on the provided fileName and savePath.
 * Resolves the path relative to the directory of the current module.
 * @param {string} fileName - The name of the file including its extension.
 * @param {string} savePath - The directory path where the file should be saved.
 * @returns {string} The absolute file path.
 * @throws {Error} Throws an error if savePath or fileName is empty, or if savePath does not exist.
 */
function getPathName(fileName, savePath) {
    return __awaiter(this, void 0, void 0, function* () {
        // Ensure cross-platform compatibility for path separation ('/', '\')
        const folders = savePath.split(path_1.default.sep);
        // Get the current file's URL path and convert it to a file system path
        const __filepath = (0, url_1.fileURLToPath)(import.meta.url);
        // Resolve the current module's directory path by going two levels up from __filepath
        const __dirname = path_1.default.resolve(__filepath, '..', '..', '..');
        // Validate and resolve the save directory path
        const saveDir = path_1.default.resolve(__dirname, ...folders);
        // If the directory doesn't exist, create it.
        if (!(yield (0, util_1.promisify)(fs_1.default.exists)(saveDir)))
            yield (0, util_1.promisify)(fs_1.default.mkdir)(saveDir, { recursive: true });
        // Construct and return the absolute file path
        const absolutePath = path_1.default.join(saveDir, fileName);
        return absolutePath;
    });
}
