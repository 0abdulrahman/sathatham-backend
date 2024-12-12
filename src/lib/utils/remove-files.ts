import fs from "fs";
import { promisify } from "util";
import getPathName from "./get-path-name.js";
import { NextFunction, Request, Response } from "express";
import { RequestFiles } from "../types/request.js";

const unlinkAsync = promisify(fs.unlink);

/**
 * Removes specified files from the server.
 *
 * @param {string[]} fileNames - The names of the files to be removed.
 * @param {string} filePath - The base path where files are stored.
 */
export const removeFiles = async (fileNames: string[], filePath: string) => {
  const removalPromises = fileNames.map(async (url) => {
    // Get the file name by splitting its url and get the last element
    // ex: /../../element-name.extension
    const path = await getPathName(url.split("/").reverse()[0], filePath);
    return unlinkAsync(path);
  });

  await Promise.all(removalPromises);
};

/**
 * Removes files from the server if the request fails.
 *
 * @param {Request} req        - The Express request object.
 * @param {NextFunction} next  - The Express next middleware function.
 * @returns {Promise<void>}    A promise that resolves when all files have been removed.
 */
export const removeFilesWhenError = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // If the request had a file, delete it upon fail
  if (req.file) {
    const filenameSegments = req.file.filename.split("/");
    const filename = filenameSegments[filenameSegments.length - 1];

    const filePath = await getPathName(filename, req.file.destination);
    await unlinkAsync(filePath);
  }

  // If the request has multiple files, delete all of them
  if (req.files && Object.keys(req.files).length > 0) {
    const removalPromises: Promise<void>[] = [];

    Object.keys(req.files).forEach((fieldName) => {
      const files = (req.files as RequestFiles)[fieldName];

      files.forEach((file) => {
        const filenameSegments = file.filename.split("/");
        const filename = filenameSegments[filenameSegments.length - 1];

        const removalPromise = getPathName(filename, file.destination)
          .then((path) => unlinkAsync(path))
          .catch((err) => next(err));
        removalPromises.push(removalPromise);
      });
    });

    await Promise.all(removalPromises);
  }
};
