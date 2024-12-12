import { z } from "zod";
import { isValidObjectId } from "mongoose";
import validator from "validator";
import { ROLE } from "../constants/roles";

export const UserSchema = z
  .object({
    username: z.string({ required_error: "Username is required!" }).min(2, "Username must be at least 2 characters long."),
    email: z.string({ required_error: "Email is required!" }).email("Please provide a valid email address."),
    password: z
      .string({ required_error: "Password is required!" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$#\^!%*?&]{8,}$/,
        "Password must be at least 8 characters long, and have at least one uppercase letter, one lowercase letter and one number."
      ),
    passwordConfirm: z.string({ required_error: "Password confirmation is required!" }),
    firstName: z.string({ required_error: "First name is required!" }).min(2, "First name must be at least 2 characters long."),
    lastName: z.string().min(2, "Last name must be at least 2 characters long.").optional(),
    role: z.nativeEnum(ROLE, { message: "Invalid role specified." }).default(ROLE.STUDENT),
    photo: z.string().optional(),
    blocked: z.boolean().default(false),
    addresses: z
      .array(
        z.object({
          name: z.string({ required_error: "Address name is required" }).min(1, "Address name is required"),
          city: z.string({ required_error: "Address city is required" }).min(1, "Address city is required"),
          street: z.string({ required_error: "Address street is required" }).min(1, "Address street is required"),
          phone: z.custom((val) => validator.isMobilePhone(val), "Addres phone number must be a valid number!"),
        })
      )
      .optional(),
    wishlist: z.array(z.string()).default([]),
  })
  .strict();

export const DocumentSchema = z
  .object({
    _id: z.custom((val) => isValidObjectId(val)),
    createAt: z.date(),
    updatedAt: z.date(),
    fullName: z.string(),
    passwordChangeDate: z.union([z.date(), z.number()]).optional(),
    passwordResetToken: z.string().optional(),
    passwordResetExpiration: z.date().optional(),
    active: z.boolean().default(true),
    passwordChangedAfterToken: z.function().args(z.date()).returns(z.boolean()),
    generatePasswordResetToken: z.function().returns(z.string()),
  })
  .merge(UserSchema);

export type UserI = z.infer<typeof DocumentSchema>;
