import { Router } from "express";
import { upload } from "./multer-setup.js";
import { uploadFile, uploadMultipleFiles } from "./upload.controller.js";
import authenticate from "../../middlewares/authenticate.middleware.js";

export const uploadRouter = Router();

uploadRouter.post("/single", authenticate, upload.single("file"), uploadFile);

uploadRouter.post("/multiple", authenticate, upload.fields([{ name: "files" }]), uploadMultipleFiles);
