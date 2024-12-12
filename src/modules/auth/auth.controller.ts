import { CookieOptions, NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { promisify } from "util";
import { RequestType } from "../../lib/types/request.js";
import { UserI, UserSchema } from "../../lib/schemes/user.schema.js";
import catchAsync from "../../lib/utils/catch-async.js";
import handleValidation from "../../lib/utils/handle-validation.js";
import AppError from "../../lib/utils/app-error.js";
import { User } from "../../../database/models/user.model.js";

const generateAndSendToken = (user: UserI, statusCode: number, req: Request, res: Response) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: `${process.env.JWT_EXPIRATION_TIME}d`,
  });

  // Set the token in the cookies as HTTP only that expires in 7 days
  const cookieOptions: CookieOptions = {
    expires: new Date(Date.now() + Number(process.env.JWT_EXPIRATION_TIME) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    // If we're in production, only send the cookie in a secured connection (https)
    // secure: req.secure,
  };

  // Only save the token in cookies if the rememberMe is set to true
  if (req.body.rememberMe) res.cookie("token", token, cookieOptions);

  res.status(statusCode).json({ status: "success", statusCode, data: { token, user } });
};

export default class AuthHandlers {
  signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const candidate = handleValidation(UserSchema.omit({ role: true }).safeParse(req.body));

    if (candidate.password !== candidate.passwordConfirm) {
      // Validation might pass but passwords are not the same, so check first
      return next(new AppError("Passwords don't match!", 400));
    }

    // Only add the photo if it exists so that it doesn't overrides the default photo with blank one
    if (req.file) (candidate as any).photo = req.file.filename;

    // Create the user
    const newUser = await User.create(candidate);

    // Remove the password from the user document before sending it
    (newUser.password as any) = undefined;

    // Create a JWT token to send it to the client
    generateAndSendToken(newUser, 201, req, res);
  });

  login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const candidate = req.body;

    // Return a 400 response if any of both login fields is missing
    if (!candidate.username || !candidate.password) {
      return next(new AppError("Username and password are required!", 400));
    }

    // Check if there's a user with the received username
    const user = await User.findOne({ username: candidate.username }).select("+password -wishlist");

    // If there's no user, or the password is incorrect return a 401 response
    if (!user || !(await bcrypt.compare(candidate.password, user.password)))
      return next(new AppError("Incorrect username or password!", 401));

    // Delete the password field before sending the user object to the client
    (user.password as any) = undefined;

    // Generate a new token for every successful login attempt
    generateAndSendToken(user, 200, req, res);
  });

  loginWithToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tokenCookie: string | undefined = req.cookies["token"];

    // - Check if the token exists
    if (!tokenCookie) return next(new AppError("You are not logged in, please log in to have access!", 401));

    // - Verify the token
    const decodedToken: { id: string; iat: number; exp: number } = await promisify(jwt.verify as any)(tokenCookie, process.env.JWT_SECRET);

    // - Check if the user still exists in the DB, because maybe the user has been deleted but his token hasn't expired yet!
    const user = await User.findById(decodedToken.id, { wishlist: 0 });
    if (!user) return next(new AppError("This token belongs to a user that no longer exists!", 401));

    // - Check if the user has changed their password AFTER the token was issued, if they did that means this token should not be valid
    //   and we have to prevent anyone from accessing the app with this old token

    if (user.passwordChangedAfterToken(new Date(decodedToken.iat * 1000))) {
      // => Multiply the issue date by 1000 because it's in seconds not milliseconds.

      return next(new AppError("User recently changed their password, please login again!", 401));
    }

    res.status(200).json({ status: "success", statusCode: 200, data: { token: tokenCookie, user } });
  });

  logout = catchAsync(async (req: RequestType, res: Response, next: NextFunction) => {
    res.clearCookie("token").status(200).json({ status: "success", statusCode: 200, message: "Logged out successfully!" });
  });
}
