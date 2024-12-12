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
exports.saveFile = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const get_path_name_1 = __importDefault(require("../../lib/utils/get-path-name"));
const saveFile = (filename, savePath) => __awaiter(void 0, void 0, void 0, function* () {
    if (Array.isArray(filename)) {
        const operations = filename.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            const cacheDir = yield (0, get_path_name_1.default)("", "public/cache");
            const filePath = path_1.default.join(cacheDir, file);
            if (yield fs_extra_1.default.pathExists(filePath)) {
                const saveDir = yield (0, get_path_name_1.default)("", "public/images" + savePath);
                fs_extra_1.default.ensureDirSync(cacheDir); // Ensure cache directory exist
                fs_extra_1.default.ensureDirSync(saveDir); // Ensure save directory exist
                const oldPath = path_1.default.join(cacheDir, file);
                const newPath = path_1.default.join(saveDir, file);
                try {
                    // Move file from cache to storage
                    yield fs_extra_1.default.move(oldPath, newPath);
                    const fullPath = process.env.NODE_ENV === "development"
                        ? `http://localhost:${process.env.PORT}/images${savePath}/${file}`
                        : `https://e-commerce.thelanerealestate.com/images${savePath}/${file}`;
                    return fullPath;
                }
                catch (error) {
                    throw new Error("[SAVE_FILE]: Error moving cached file to storage.");
                }
            }
            else {
                throw new Error("[SAVE_FILE]: File not found in cache, it could be the file hasn't been uploaded, or has already been moved.");
            }
        }));
        const imagesPaths = yield Promise.all(operations);
        return imagesPaths;
    }
    else {
        const cacheDir = yield (0, get_path_name_1.default)("", "public/cache");
        const filePath = path_1.default.join(cacheDir, filename);
        if (yield fs_extra_1.default.pathExists(filePath)) {
            const saveDir = yield (0, get_path_name_1.default)("", "public/images" + savePath);
            fs_extra_1.default.ensureDirSync(cacheDir); // Ensure cache directory exist
            fs_extra_1.default.ensureDirSync(saveDir); // Ensure save directory exist
            const oldPath = path_1.default.join(cacheDir, filename);
            const newPath = path_1.default.join(saveDir, filename);
            try {
                // Move file from cache to storage
                yield fs_extra_1.default.move(oldPath, newPath);
                const fullPath = process.env.NODE_ENV === "development"
                    ? `http://localhost:${process.env.PORT}/images${savePath}/${filename}`
                    : `https://e-commerce.thelanerealestate.com/images${savePath}/${filename}`;
                return fullPath;
            }
            catch (error) {
                throw new Error("[SAVE_FILE]: Error moving cached file to storage.");
            }
        }
        else {
            throw new Error("[SAVE_FILE]: File not found in cache, it could be the file hasn't been uploaded, or has already been moved.");
        }
    }
});
exports.saveFile = saveFile;
