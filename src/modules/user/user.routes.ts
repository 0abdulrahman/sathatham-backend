import { Router } from "express";
import UserHandlers from "./user.controller.js";
import authenticate from "../../middlewares/authenticate.middleware.js";
import { ImageUpload } from "../../lib/utils/images-upload.js";
import { handleRolesHierarchy } from "../../middlewares/handle-roles-hierarchy.middleware.js";
import authorize from "../../middlewares/authorize.middleware.js";
import { ROLE } from "../../lib/constants/roles.js";

export const userRouter = Router();
const userHandlers = new UserHandlers();
const imageUpload = new ImageUpload("photo", "user", "public/images/users", [500, 500]);

userRouter.use(authenticate);

userRouter
  .route("/")
  .get(authorize(ROLE.MANAGER, ROLE.MODERATOR, ROLE.TEACHER), userHandlers.getUsers)
  .post(
    authorize(ROLE.MANAGER, ROLE.MODERATOR),
    imageUpload.handleUpload,
    imageUpload.optimizeUpload,
    handleRolesHierarchy,
    userHandlers.createUser
  );

userRouter
  .route("/:id")
  .get(authorize(ROLE.MANAGER, ROLE.MODERATOR, ROLE.TEACHER), userHandlers.getUser)
  .patch(
    authorize(ROLE.MANAGER, ROLE.MODERATOR, ROLE.TEACHER),
    imageUpload.handleUpload,
    imageUpload.optimizeUpload,
    handleRolesHierarchy,
    userHandlers.updateUser
  )
  .delete(authorize(ROLE.MANAGER, ROLE.MODERATOR), handleRolesHierarchy, userHandlers.deleteUser);
