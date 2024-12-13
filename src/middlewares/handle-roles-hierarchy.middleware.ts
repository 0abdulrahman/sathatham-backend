import { NextFunction, Response } from "express";
import { ROLE } from "../lib/constants/roles.js";
import catchAsync from "../lib/utils/catch-async.js";
import { RequestType } from "../lib/types/request.js";
import AppError from "../lib/utils/app-error.js";
import { User } from "../../database/models/user.model.js";

/**
 * Middleware to handle role-based access control by comparing the roles of the current user and the target user.
 * Ensures that users cannot perform actions on other users with equal or higher roles.
 *
 * @param {RequestType} req - The Express request object, extended with user role information.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @throws {AppError} Throws an error with a 403 status code if the current user has insufficient permissions.
 */
export const handleRolesHierarchy = catchAsync(async (req: RequestType, res: Response, next: NextFunction) => {
  // Define role hierarchy with power levels
  const roles = [
    { role: ROLE.MANAGER, power: 999999999999999 },
    { role: ROLE.MODERATOR, power: 3 },
    { role: ROLE.TEACHER, power: 2 },
    { role: ROLE.STUDENT, power: 1 },
  ];

  // Get the role of the current user and the target user
  const currentUserRole = req.user!.role;
  let targetUserRole: string;

  // If the target user id exists, look for it in the database
  if (req.params.id) {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return next(new AppError(`Couldn't find a user with an id of ${req.params.id}`, 404));

    targetUserRole = targetUser.role!;
  } else {
    // If it doesn't, use the `role` specified in the req.body or use the `USER` role as a fallback
    targetUserRole = req.body.role || ROLE.STUDENT;
  }

  // Find the power levels for the current and target users
  const currentUserPower = roles.find((el) => el.role === currentUserRole)!.power;
  const targetUserPower = roles.find((el) => el.role === targetUserRole)?.power;

  if (!targetUserPower) return next(new AppError("The specified role is not a valid role!", 400));

  // Check if the current user has sufficient permissions
  if (currentUserPower === targetUserPower) {
    return next(new AppError("You cannot create, update or delete a user whose role is the same as you!", 403));
  } else if (currentUserPower < targetUserPower) {
    return next(new AppError("You cannot create, update or delete a user whose role is higher than you!", 403));
  }

  // If the current user has sufficient permissions, proceed to the next middleware
  next();
});
