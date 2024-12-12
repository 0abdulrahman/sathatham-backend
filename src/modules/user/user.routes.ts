import { Router } from "express";
import UserHandlers from "./user.controller.js";
import authenticate from "../../middlewares/authenticate.middleware.js";
import { ImageUpload } from "../../lib/utils/images-upload.js";
import { handleRolesHierarchy } from "../../middlewares/handle-roles-hierarchy.middleware.js";

export const userRouter = Router();
const userHandlers = new UserHandlers();
const imageUpload = new ImageUpload("photo", "user", "public/images/users", [500, 500]);

userRouter.use(authenticate);

userRouter
  .route("/")
  .get(userHandlers.getUsers)
  .post(imageUpload.handleUpload, imageUpload.optimizeUpload, handleRolesHierarchy, userHandlers.createUser);

userRouter
  .route("/:id")
  .get(userHandlers.getUser)
  .patch(imageUpload.handleUpload, imageUpload.optimizeUpload, handleRolesHierarchy, userHandlers.updateUser)
  .delete(handleRolesHierarchy, userHandlers.deleteUser);
