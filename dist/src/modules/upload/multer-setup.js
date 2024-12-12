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
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const get_path_name_1 = __importDefault(require("../../lib/utils/get-path-name"));
// Multer configuration: Store the file in the cache directory
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => __awaiter(void 0, void 0, void 0, function* () {
        const cacheDir = yield (0, get_path_name_1.default)("", "public/cache"); // Directory for temporary cache
        fs_extra_1.default.ensureDirSync(cacheDir); // Ensure cache directory exist
        cb(null, cacheDir);
    }),
    filename: (req, file, cb) => {
        const uniqueName = `${Math.round(Date.now() / 1000)}-${Math.floor(Math.random() * 10000)}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
exports.upload = (0, multer_1.default)({ storage });
