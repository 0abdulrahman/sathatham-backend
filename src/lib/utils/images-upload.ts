import { NextFunction, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import crypto from "crypto";
import sharp from "sharp";
import getPathName from "./get-path-name.js";
import catchAsync from "./catch-async.js";
import AppError from "./app-error.js";
import { RequestFiles } from "../types/request.js";

type FileName = "user";

const generateFileName = (directory: string, uniqueFileName: string) => {
  if (process.env.NODE_ENV === "production") {
    return `https://api.thelanerealestate.com/${directory}/${uniqueFileName}`;
  } else {
    return `http://localhost:${process.env.PORT}/${directory}/${uniqueFileName}`;
  }
};

/**
 * Class for handling image upload and optimization.
 */
export class ImageUpload {
  private fieldName: string;
  private fileName: FileName;
  private savePath: string;
  private dimensions?: number[] | "no-resize" = [500, 500];

  /**
   * Creates an instance of ImageUpload.
   * @param {string} fieldName - The name of the form field for the image file.
   * @param {FileName} fileName - The desired file name for the uploaded image.
   * @param {string} savePath - The path where the image should be saved.
   * @param {number[]} [dimensions] - Optional dimensions to resize the image to.
   */
  constructor(fieldName: string, fileName: FileName, savePath: string, dimensions?: number[] | "no-resize") {
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
  handleUpload(req: Request, res: Response, next: NextFunction) {
    return multer({
      // Store the file in memory for later processing
      storage: multer.memoryStorage(),

      // Filter to only allow image files
      fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if (file.mimetype.startsWith("image")) {
          cb(null, true);
        } else {
          cb(new AppError("The provided file is not an image, only images are allowed.", 400));
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
  optimizeUpload(req: Request, res: Response, next: NextFunction) {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      if (!req.file && req.body[this.fieldName]) return next(new AppError("Please specify a valid image", 400));

      // If no file is uploaded, skip optimization
      if (!req.file) return next();

      // Generate a unique filename, then add its name and destination (e.g. public/images/users) to the file object
      const uniqueFileName = `${this.fileName}-${Date.now()}-${crypto.randomBytes(12).toString("hex")}.jpeg`;
      const directory = this.savePath.split("public/")[1];
      req.file.filename = generateFileName(directory, uniqueFileName);
      req.file.destination = this.savePath;

      // Prepare the optimization chain
      const optimize = sharp(req.file.buffer);

      // Resize the image unless dimensions are set to 'no-resize'
      if (this.dimensions !== "no-resize") {
        optimize.resize(...this.dimensions!);
      }

      // Convert and save the image as JPEG
      await optimize
        .toFormat("jpg")
        .jpeg({ quality: 90 })
        .toFile(await getPathName(uniqueFileName, this.savePath));

      next();
    })(req, res, next);
  }
}

/**
 * Class for handling images upload and optimization.
 */
export class ImagesUpload {
  private fields: multer.Field[];
  private fileName: FileName;
  private savePath: string;
  private dimensions?: number[] | "no-resize" = [500, 500];

  /**
   * Creates an instance of ImageUpload.
   * @param {multer.Field[]} fields  - The name and max images count of the images form field.
   * @param {FileName} fileName        - The desired file name for the uploaded image.
   * @param {string} savePath        - The path where the image should be saved.
   * @param {number[]} [dimensions]  - Optional dimensions to resize the image to.
   */
  constructor(fields: multer.Field[], fileName: FileName, savePath: string, dimensions?: number[] | "no-resize") {
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
  handleUpload(req: Request, res: Response, next: NextFunction) {
    return multer({
      // Store the file in memory for later processing
      storage: multer.memoryStorage(),
      // Filter to only allow image files
      fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if (file.mimetype.startsWith("image")) {
          cb(null, true);
        } else {
          cb(new AppError(`The provided file (${file.originalname}) is not an image, only images are allowed.`, 400));
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
  optimizeUpload(req: Request, res: Response, next: NextFunction) {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      // If no files are uploaded, skip optimization
      if (!Object.keys(req.files || {})?.length) return next();

      const uploadPromises: Promise<void>[] = [];

      Object.keys(req.files!).forEach(async (fieldName) => {
        // Prepare the files found in in the current field in the loop
        const files = (req.files as unknown as { [fieldname: string]: Express.Multer.File[] })[fieldName];

        files.forEach(async (file, i) => {
          // Generate a unique filename, then add its name and destination (e.g. public/images/users) to the file object
          const uniqueFileName = `${this.fileName}-${Date.now()}-${crypto.randomBytes(12).toString("hex")}.jpeg`;
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
          (req.files as unknown as RequestFiles)[file.fieldname][i].filename = generateFileName(directory, uniqueFileName);
          (req.files as unknown as RequestFiles)[file.fieldname][i].destination = this.savePath;

          // Prepare the optimization chain
          const optimize = sharp(file.buffer);

          // Resize the image unless dimensions are set to 'no-resize'
          if (this.dimensions !== "no-resize") {
            optimize.resize(...this.dimensions!);
          }

          // Prepare the promise to convert and save the image as JPEG
          const uploadPromise = getPathName(uniqueFileName, this.savePath)
            .then((path) => optimize.toFormat("jpg").jpeg({ quality: 90 }).toFile(path))
            .catch((err) => next(err));

          // Push the promise to the promises array to wait for all of them together
          uploadPromises.push(uploadPromise as Promise<void>);
        });
      });

      await Promise.all(uploadPromises);

      next();
    })(req, res, next);
  }
}
