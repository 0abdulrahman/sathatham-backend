import jwt from "jsonwebtoken";
import { NextFunction, Response } from "express";
import { promisify } from "util";
import catchAsync from "../lib/utils/catch-async.js";
import AppError from "../lib/utils/app-error.js";
import { RequestType } from "../lib/types/request.js";
import { User } from "../../database/models/user.model.js";

/**
 * A middleware to authenticate the user based on JWT token.
 * @param {RequestType} req - Extended Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
const authenticate = catchAsync(async (req: RequestType, res: Response, next: NextFunction) => {
  const tokenHeader: string | undefined = req.headers.authorization;

  // - Check if the token exists
  if (!tokenHeader?.startsWith("Bearer")) return next(new AppError("You are not logged in, please log in to have access!", 401));

  // - Split the token header to get only the token without `Bearer`
  const token = tokenHeader.split(" ")[1];

  // - Verify the token
  const decodedToken: { id: string; iat: number; exp: number } = await promisify(jwt.verify as any)(token, process.env.JWT_SECRET);

  // - Check if the user still exists in the DB, because maybe the user has been deleted but his token hasn't expired yet!
  const user = await User.findById(decodedToken.id);
  if (!user) return next(new AppError("This token belongs to a user that no longer exists!", 401));

  // - Else if everything's fine, add the user id in the request. We'll need it later in next middlewares.
  req.user = user;

  // - Grant access to the protected-route
  return next();
});

export default authenticate;
