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
exports.ImagesUpload = exports.ImageUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const crypto_1 = __importDefault(require("crypto"));
const sharp_1 = __importDefault(require("sharp"));
const get_path_name_js_1 = __importDefault(require("./get-path-name.js"));
const catch_async_js_1 = __importDefault(require("./catch-async.js"));
const app_error_js_1 = __importDefault(require("./app-error.js"));
const generateFileName = (directory, uniqueFileName) => {
    if (process.env.NODE_ENV === "production") {
        return `https://api.thelanerealestate.com/${directory}/${uniqueFileName}`;
    }
    else {
        return `http://localhost:${process.env.PORT}/${directory}/${uniqueFileName}`;
    }
};
/**
 * Class for handling image upload and optimization.
 */
class ImageUpload {
    /**
     * Creates an instance of ImageUpload.
     * @param {string} fieldName - The name of the form field for the image file.
     * @param {FileName} fileName - The desired file name for the uploaded image.
     * @param {string} savePath - The path where the image should be saved.
     * @param {number[]} [dimensions] - Optional dimensions to resize the image to.
     */
    constructor(fieldName, fileName, savePath, dimensions) {
        this.dimensions = [500, 500];
        this.fieldName = fieldName;
        this.fileName = fileName;
        this.savePath = savePath;
        this.dimensions = dimensions;
        // Bind methods to ensure the correct 'this' context
        this.handleUpload = this.handleUpload.bind(this);
        this.optimizeUpload = this.optimizeUpload.bind(this);
    }
    /**
     * Sets up multer for handling image uploads.
     * @param {Request} req - The Express request object.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     */
    handleUpload(req, res, next) {
        return (0, multer_1.default)({
            // Store the file in memory for later processing
            storage: multer_1.default.memoryStorage(),
            // Filter to only allow image files
            fileFilter: (req, file, cb) => {
                if (file.mimetype.startsWith("image")) {
                    cb(null, true);
                }
                else {
                    cb(new app_error_js_1.default("The provided file is not an image, only images are allowed.", 400));
                }
            },
        }).single(this.fieldName)(req, res, next);
    }
    /**
     * Optimizes and resizes the uploaded image.
     * @param {Request} req - The Express request object.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     */
    optimizeUpload(req, res, next) {
        return (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (!req.file && req.body[this.fieldName])
                return next(new app_error_js_1.default("Please specify a valid image", 400));
            // If no file is uploaded, skip optimization
            if (!req.file)
                return next();
            // Generate a unique filename, then add its name and destination (e.g. public/images/users) to the file object
            const uniqueFileName = `${this.fileName}-${Date.now()}-${crypto_1.default.randomBytes(12).toString("hex")}.jpeg`;
            const directory = this.savePath.split("public/")[1];
            req.file.filename = generateFileName(directory, uniqueFileName);
            req.file.destination = this.savePath;
            // Prepare the optimization chain
            const optimize = (0, sharp_1.default)(req.file.buffer);
            // Resize the image unless dimensions are set to 'no-resize'
            if (this.dimensions !== "no-resize") {
                optimize.resize(...this.dimensions);
            }
            // Convert and save the image as JPEG
            yield optimize
                .toFormat("jpg")
                .jpeg({ quality: 90 })
                .toFile(yield (0, get_path_name_js_1.default)(uniqueFileName, this.savePath));
            next();
        }))(req, res, next);
    }
}
exports.ImageUpload = ImageUpload;
/**
 * Class for handling images upload and optimization.
 */
class ImagesUpload {
    /**
     * Creates an instance of ImageUpload.
     * @param {multer.Field[]} fields  - The name and max images count of the images form field.
     * @param {FileName} fileName        - The desired file name for the uploaded image.
     * @param {string} savePath        - The path where the image should be saved.
     * @param {number[]} [dimensions]  - Optional dimensions to resize the image to.
     */
    constructor(fields, fileName, savePath, dimensions) {
        this.dimensions = [500, 500];
        this.fields = fields;
        this.fileName = fileName;
        this.savePath = savePath;
        this.dimensions = dimensions;
        // Bind methods to ensure the correct 'this' context
        this.handleUpload = this.handleUpload.bind(this);
        this.optimizeUpload = this.optimizeUpload.bind(this);
    }
    /**
     * Sets up multer for handling image uploads.
     * @param {Request} req - The Express request object.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     */
    handleUpload(req, res, next) {
        return (0, multer_1.default)({
            // Store the file in memory for later processing
            storage: multer_1.default.memoryStorage(),
            // Filter to only allow image files
            fileFilter: (req, file, cb) => {
                if (file.mimetype.startsWith("image")) {
                    cb(null, true);
                }
                else {
                    cb(new app_error_js_1.default(`The provided file (${file.originalname}) is not an image, only images are allowed.`, 400));
                }
            },
        }).fields(this.fields)(req, res, next);
    }
    /**
     * Optimizes and resizes the uploaded image.
     * @param {Request} req - The Express request object.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     */
    optimizeUpload(req, res, next) {
        return (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            // If no files are uploaded, skip optimization
            if (!((_a = Object.keys(req.files || {})) === null || _a === void 0 ? void 0 : _a.length))
                return next();
            const uploadPromises = [];
            Object.keys(req.files).forEach((fieldName) => __awaiter(this, void 0, void 0, function* () {
                // Prepare the files found in in the current field in the loop
                const files = req.files[fieldName];
                files.forEach((file, i) => __awaiter(this, void 0, void 0, function* () {
                    // Generate a unique filename, then add its name and destination (e.g. public/images/users) to the file object
                    const uniqueFileName = `${this.fileName}-${Date.now()}-${crypto_1.default.randomBytes(12).toString("hex")}.jpeg`;
                    // Add the file name and path to the file object in the current iteration of the fields' files.
                    /* Example
                        {
                          fieldName: [
                            { // file number 0
                              filename: uniqueFileName,
                              destination: this.savePath
                            }
                          ]
                        }
                       */
                    const directory = this.savePath.split("public/")[1];
                    req.files[file.fieldname][i].filename = generateFileName(directory, uniqueFileName);
                    req.files[file.fieldname][i].destination = this.savePath;
                    // Prepare the optimization chain
                    const optimize = (0, sharp_1.default)(file.buffer);
                    // Resize the image unless dimensions are set to 'no-resize'
                    if (this.dimensions !== "no-resize") {
                        optimize.resize(...this.dimensions);
                    }
                    // Prepare the promise to convert and save the image as JPEG
                    const uploadPromise = (0, get_path_name_js_1.default)(uniqueFileName, this.savePath)
                        .then((path) => optimize.toFormat("jpg").jpeg({ quality: 90 }).toFile(path))
                        .catch((err) => next(err));
                    // Push the promise to the promises array to wait for all of them together
                    uploadPromises.push(uploadPromise);
                }));
            }));
            yield Promise.all(uploadPromises);
            next();
        }))(req, res, next);
    }
}
exports.ImagesUpload = ImagesUpload;
