import { isValidObjectId } from "mongoose";
import AppError from "./app-error.js";

export default function validateId(id: string) {
  if (!isValidObjectId(id)) throw new AppError("Invalid id specified, please make sure it's a valid id!", 400);
}
