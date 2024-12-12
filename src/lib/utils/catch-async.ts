import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async function and catches any errors that occur,
 * passing them to the error-handling middleware via the `next` function.
 *
 * This utility is used to simplify error handling for async route handlers
 * in a Node.js application using the Express framework.
 *
 * @param {function} asyncFunction - The async handler function to be wrapped.
 * @returns {function} A new function that wraps the async function with error catching.
 */
export default function catchAsync(
  asyncFunction: (req: Request, res: Response, next: NextFunction) => Promise<any>
): (req: Request, res: Response, next: NextFunction) => any {
  return (req: Request, res: Response, next: NextFunction) => {
    /*
      When calling `next` with an argument, Express assumes that it's an error since nothing gets passed into `next` as an argument
      except for errors, and then ignores all middlewares in the stack and fires the global error-handling middleware
    */
    asyncFunction(req, res, next).catch(async (err) => {
      // Fire the global error-handling middleware with the error object.
      next(err);
    });
  };
}
