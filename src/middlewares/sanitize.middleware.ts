import { NextFunction, Request, Response } from "express";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

/**
 * Middleware to sanitize request body to prevent XSS attacks.
 *
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The outgoing response object.
 * @param {NextFunction} next - The next middleware function.
 */
export default function sanitize(req: Request, res: Response, next: NextFunction) {
  // Recursively sanitize all string properties of an object.
  const sanitizeObject = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = DOMPurify.sanitize(obj[key]);
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  sanitizeObject(req.body);

  next();
}
