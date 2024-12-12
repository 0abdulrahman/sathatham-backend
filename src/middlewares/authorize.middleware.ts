import { NextFunction, Response } from "express";
import { ROLE } from "../lib/constants/roles.js";
import { RequestType } from "../lib/types/request.js";
import AppError from "../lib/utils/app-error.js";

/**
 * A middleware to check if the user is authorized to have access or perform a certain action based on his role
 * @param {ROLE[]} roles An array of rules which are allowed to have access
 */
// This middleware is wrapped inside another function that receives the `roles` argument because middlewares cannot receive custom arguments,
// thus we had to wrap it inside a function that returns the middleware itself in order to receive custom arguments into the wrapper.
const authorize =
  (...roles: ROLE[]) =>
  async (req: RequestType, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user!.role!)) {
      return next(new AppError("You do not have permission to perform this action!", 401));
    } else {
      next();
    }
  };

export default authorize;
