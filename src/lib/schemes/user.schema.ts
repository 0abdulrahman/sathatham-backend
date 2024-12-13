import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { ROLE } from "../constants/roles";

export const UserSchema = z
  .object({
    username: z.string({ required_error: "Username is required" }).min(1, "Username is required"),
    password: z
      .string({ required_error: "Password is required!" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$#\^!%*?&]{8,}$/,
        "Password must be at least 8 characters long, and have at least one uppercase letter, one lowercase letter and one number."
      ),
    passwordConfirm: z.string({ required_error: "Password confirmation is required!" }),
    firstName: z.string({ required_error: "First name is required!" }).min(2, "First name must be at least 2 characters long."),
    familyName: z.string({ required_error: "Family name is required!" }).min(2, "Family name must be at least 2 characters long."),
    sex: z.enum(["male", "female"], { required_error: "User sex is required", message: "Please provide a valid sex type" }),
    role: z.nativeEnum(ROLE, { message: "Invalid role specified." }).default(ROLE.STUDENT),
    photo: z.string().optional(),
    grade: z.string().optional(),
    studentData: z
      .object({
        approved: z.boolean().default(false),
        studentNumber: z.number({ required_error: "Student number is required!" }).min(0, "Student number is invalid."),
        IDNumber: z.string({ required_error: "Student ID number is required!" }).min(1, "Student ID number is invalid."),
        class: z.string({ required_error: "Student class is required." }).min(1, "Student class  is required"),
        GPA: z.number().optional(),
        fatherName: z.string({ required_error: "Father name is required!" }).min(2, "Father name must be at least 2 characters long."),
        motherName: z.string({ required_error: "Mother name is required!" }).min(2, "Mother name must be at least 2 characters long."),
        contactInformation: z.string({ required_error: "Contact information is required" }).min(1, "Contact information is required"),
        birthDate: z.coerce.date({ required_error: "Birth date is required", invalid_type_error: "Please provide a valid date" }),
        nationality: z.string({ required_error: "Nationality is required" }).min(1, "Nationality is required"),
        address: z.string({ required_error: "Address is required" }).min(1, "Address is required"),
        report: z.string().optional(),
      })
      .optional(),
  })
  .strict();

export const DocumentSchema = z
  .object({
    _id: z.custom((val) => isValidObjectId(val)),
    createdAt: z.date(),
    updatedAt: z.date(),
    fullName: z.string(),
  })
  .merge(UserSchema)
  .refine((values) => values.password !== values.passwordConfirm, {
    message: "Passwords do not match!",
    path: ["passwordConfirm"],
  });

export type UserI = z.infer<typeof DocumentSchema>;
