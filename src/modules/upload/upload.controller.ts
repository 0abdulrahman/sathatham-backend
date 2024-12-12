import { NextFunction, Request, Response } from "express";
import schedule from "node-schedule";
import path from "path";
import fs from "fs-extra";
import { RESTResponse } from "../../lib/utils/rest-api-response.js";
import catchAsync from "../../lib/utils/catch-async.js";
import AppError from "../../lib/utils/app-error.js";
import getPathName from "../../lib/utils/get-path-name.js";

export const uploadFile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;

  if (!file) {
    return next(new AppError("No file uploaded", 400));
  }

  // Store the file info in the cache with a 10-minute expiry
  const expiryDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Schedule file deletion after 10 minutes if not used
  schedule.scheduleJob(expiryDate, async () => {
    const cacheDir = await getPathName("", "public/cache");
    const filePath = path.join(cacheDir, file.filename);

    const fileExists = await fs.pathExists(filePath);

    if (fileExists) await fs.unlink(filePath);
  });

  // Return the file name in the response
  RESTResponse.success({ file: file.filename }, res);
});

export const uploadMultipleFiles = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const files = req.files;

  if (!files || (Array.isArray(files) && files.length === 0)) {
    return next(new AppError("No files uploaded", 400));
  }

  // Store the file info in the cache with a 10-minute expiry
  const expiryDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const filesNames: string[] = [];

  // Convert req.files to { fieldName: File[] }
  const fileGroups = req.files as { [fieldname: string]: Express.Multer.File[] };

  for (const fieldName of Object.keys(fileGroups)) {
    const fileGroup = fileGroups[fieldName];

    for (const file of fileGroup) {
      filesNames.push(file.filename);

      // Schedule file deletion after 10 minutes if not used
      schedule.scheduleJob(expiryDate, async () => {
        const cacheDir = await getPathName("", "public/cache");
        const filePath = path.join(cacheDir, file.filename);

        const fileExists = await fs.pathExists(filePath);

        if (fileExists) await fs.unlink(filePath);
      });
    }
  }

  // Return the file names in the response
  RESTResponse.success({ files: filesNames }, res);
});
