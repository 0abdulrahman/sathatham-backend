import { Request, Response } from "express";
import { NextFunction } from "express-serve-static-core";
import { PipelineStage } from "mongoose";
import { RequestType } from "../../lib/types/request.js";
import { User } from "../../../database/models/user.model.js";
import { removeFiles, removeFilesWhenError } from "../../lib/utils/remove-files.js";
import AppError from "../../lib/utils/app-error.js";
import catchAsync from "../../lib/utils/catch-async.js";
import { filterPipe, paginatePipe, projectPipe, searchPipe, sortPipe } from "../../lib/utils/aggregate-api.js";
import validateId from "../../lib/utils/validate-id.js";
import handleValidation from "../../lib/utils/handle-validation.js";
import { UserSchema } from "../../lib/schemes/user.schema.js";

export default class UserHandlers {
  private async removeFilesAndHandleNotFound(req: Request, res: Response, next: NextFunction) {
    await removeFilesWhenError(req, res, next);
    return next(new AppError(`Couldn't find a user with an id of ${req.params.id}`, 404));
  }

  getUsers = catchAsync(async (req: RequestType, res: Response, next: NextFunction) => {
    const pipeline: PipelineStage[] = [
      { $project: { password: 0, wishlist: 0 } },
      ...searchPipe(req, ["username", "email", "firstName", "lastName", "role"]),
      ...filterPipe(req),
      ...sortPipe(req),
      ...projectPipe(req),
      ...paginatePipe(req, "users"),
    ];

    const users = await User.aggregate(pipeline);

    res.status(200).json({ status: "success", statusCode: 200, data: users[0] }).status(200);
  });

  getUser = catchAsync(async (req: RequestType, res: Response, next: NextFunction) => {
    validateId(req.params.id);

    const user = await User.findById(req.params.id, { wishlist: 0 });

    if (!user) return next(new AppError(`Couldn't find a user with an id of ${req.params.id}`, 404));

    res.status(200).json({ status: "success", statusCode: 200, data: { user } }).status(200);
  });

  createUser = catchAsync(async (req: RequestType, res: Response, next: NextFunction) => {
    const candidate = handleValidation(UserSchema.safeParse(req.body));

    // Only add the photo if it exists so that it doesn't overrides the default photo with blank one
    if (req.file) candidate.photo = req.file.filename;

    // Create the user
    const newUser = await User.create(candidate);

    res.status(201).json({ status: "success", statusCode: 201, data: { newUser } });
  });

  updateUser = catchAsync(async (req: RequestType, res: Response, next: NextFunction) => {
    validateId(req.params.id);

    // Prepare the user data
    const candidate = handleValidation(UserSchema.partial().safeParse(req.body));

    // Only add the photo if it exists so that it doesn't overrides the default photo with blank one
    if (req.file) {
      candidate.photo = req.file.filename;

      const user = await User.findById(req.params.id, { wishlist: 0 });

      // Remove old user photo from the storage
      user?.photo && (await removeFiles([user.photo], "public/images/users"));
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(req.params.id, candidate, {
      new: true,
      runValidators: true,
      projection: { wishlist: 0 },
    });

    if (!updatedUser) return await this.removeFilesAndHandleNotFound(req, res, next);

    res.status(200).json({ status: "success", statusCode: 200, data: { updatedUser } });
  });

  deleteUser = catchAsync(async (req: RequestType, res: Response, next: NextFunction) => {
    validateId(req.params.id);
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return next(new AppError(`Couldn't find a user with an id of ${req.params.id}`, 404));

    res.status(204).json({ status: "success", statusCode: 204, data: null });
  });
}
