import { Express } from "express-serve-static-core";
import { uploadRouter } from "../modules/upload/upload.routes";
import { authRouter } from "../modules/auth/auth.routes";
import { userRouter } from "../modules/user/user.routes";

const apiVersion = process.env.API_VERSION;

export default function Bootstrap(app: Express) {
  app.use(apiVersion + "/upload", uploadRouter);
  app.use(apiVersion + "/auth", authRouter);
  app.use(apiVersion + "/users", userRouter);
}
