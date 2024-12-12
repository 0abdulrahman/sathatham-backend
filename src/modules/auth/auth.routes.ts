import { Router } from "express";
import authenticate from "../../middlewares/authenticate.middleware.js";
import AuthHandlers from "./auth.controller.js";
import { ImageUpload } from "../../lib/utils/images-upload.js";

export const authRouter = Router();
const authHandlers = new AuthHandlers();
const imageUpload = new ImageUpload("photo", "user", "public/images/users", [500, 500]);

authRouter.post("/signup", imageUpload.handleUpload, imageUpload.optimizeUpload, authHandlers.signup);

authRouter.post("/login", authHandlers.login);

authRouter.get("/login/token", authHandlers.loginWithToken);

authRouter.use(authenticate);

authRouter.get("/logout", authHandlers.logout);
