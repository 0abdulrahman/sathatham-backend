import { NextFunction, Request, Response } from "express";
import AppError from "../lib/utils/app-error.js";

/**
 * Middleware to handle not found routes in an Express application.
 * This middleware creates an AppError for routes that do not exist and
 * forwards it to the global error handling middleware.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 */
export default function (req: Request, res: Response, next: NextFunction) {
  const err = new AppError(`The route ${req.originalUrl} you requested does not exist on the server.`, 404);

  // Forward the error to the global error-handling middleware by calling `next` with an argument which is the error.
  next(err);
}
