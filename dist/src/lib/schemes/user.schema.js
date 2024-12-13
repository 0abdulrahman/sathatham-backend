"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentSchema = exports.UserSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const roles_1 = require("../constants/roles");
exports.UserSchema = zod_1.z
    .object({
    username: zod_1.z.string({ required_error: "Username is required" }).min(1, "Username is required"),
    password: zod_1.z
        .string({ required_error: "Password is required!" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$#\^!%*?&]{8,}$/, "Password must be at least 8 characters long, and have at least one uppercase letter, one lowercase letter and one number."),
    passwordConfirm: zod_1.z.string({ required_error: "Password confirmation is required!" }),
    firstName: zod_1.z.string({ required_error: "First name is required!" }).min(2, "First name must be at least 2 characters long."),
    familyName: zod_1.z.string({ required_error: "Family name is required!" }).min(2, "Family name must be at least 2 characters long."),
    sex: zod_1.z.enum(["male", "female"], { required_error: "User sex is required", message: "Please provide a valid sex type" }),
    role: zod_1.z.nativeEnum(roles_1.ROLE, { message: "Invalid role specified." }).default(roles_1.ROLE.STUDENT),
    photo: zod_1.z.string().optional(),
    grade: zod_1.z.string().optional(),
    studentData: zod_1.z
        .object({
        approved: zod_1.z.boolean().default(false),
        studentNumber: zod_1.z.number({ required_error: "Student number is required!" }).min(0, "Student number is invalid."),
        IDNumber: zod_1.z.string({ required_error: "Student ID number is required!" }).min(1, "Student ID number is invalid."),
        class: zod_1.z.string({ required_error: "Student class is required." }).min(1, "Student class  is required"),
        GPA: zod_1.z.number().optional(),
        fatherName: zod_1.z.string({ required_error: "Father name is required!" }).min(2, "Father name must be at least 2 characters long."),
        motherName: zod_1.z.string({ required_error: "Mother name is required!" }).min(2, "Mother name must be at least 2 characters long."),
        contactInformation: zod_1.z.string({ required_error: "Contact information is required" }).min(1, "Contact information is required"),
        birthDate: zod_1.z.coerce.date({ required_error: "Birth date is required", invalid_type_error: "Please provide a valid date" }),
        nationality: zod_1.z.string({ required_error: "Nationality is required" }).min(1, "Nationality is required"),
        address: zod_1.z.string({ required_error: "Address is required" }).min(1, "Address is required"),
        report: zod_1.z.string().optional(),
    })
        .optional(),
})
    .strict();
exports.DocumentSchema = zod_1.z
    .object({
    _id: zod_1.z.custom((val) => (0, mongoose_1.isValidObjectId)(val)),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    fullName: zod_1.z.string(),
})
    .merge(exports.UserSchema)
    .refine((values) => values.password !== values.passwordConfirm, {
    message: "Passwords do not match!",
    path: ["passwordConfirm"],
});
