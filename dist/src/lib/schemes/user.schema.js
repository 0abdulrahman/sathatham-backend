"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentSchema = exports.UserSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const validator_1 = __importDefault(require("validator"));
const roles_1 = require("../constants/roles");
exports.UserSchema = zod_1.z
    .object({
    username: zod_1.z.string({ required_error: "Username is required!" }).min(2, "Username must be at least 2 characters long."),
    email: zod_1.z.string({ required_error: "Email is required!" }).email("Please provide a valid email address."),
    password: zod_1.z
        .string({ required_error: "Password is required!" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$#\^!%*?&]{8,}$/, "Password must be at least 8 characters long, and have at least one uppercase letter, one lowercase letter and one number."),
    passwordConfirm: zod_1.z.string({ required_error: "Password confirmation is required!" }),
    firstName: zod_1.z.string({ required_error: "First name is required!" }).min(2, "First name must be at least 2 characters long."),
    lastName: zod_1.z.string().min(2, "Last name must be at least 2 characters long.").optional(),
    role: zod_1.z.nativeEnum(roles_1.ROLE, { message: "Invalid role specified." }).default(roles_1.ROLE.STUDENT),
    photo: zod_1.z.string().optional(),
    blocked: zod_1.z.boolean().default(false),
    addresses: zod_1.z
        .array(zod_1.z.object({
        name: zod_1.z.string({ required_error: "Address name is required" }).min(1, "Address name is required"),
        city: zod_1.z.string({ required_error: "Address city is required" }).min(1, "Address city is required"),
        street: zod_1.z.string({ required_error: "Address street is required" }).min(1, "Address street is required"),
        phone: zod_1.z.custom((val) => validator_1.default.isMobilePhone(val), "Addres phone number must be a valid number!"),
    }))
        .optional(),
    wishlist: zod_1.z.array(zod_1.z.string()).default([]),
})
    .strict();
exports.DocumentSchema = zod_1.z
    .object({
    _id: zod_1.z.custom((val) => (0, mongoose_1.isValidObjectId)(val)),
    createAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    fullName: zod_1.z.string(),
    passwordChangeDate: zod_1.z.union([zod_1.z.date(), zod_1.z.number()]).optional(),
    passwordResetToken: zod_1.z.string().optional(),
    passwordResetExpiration: zod_1.z.date().optional(),
    active: zod_1.z.boolean().default(true),
    passwordChangedAfterToken: zod_1.z.function().args(zod_1.z.date()).returns(zod_1.z.boolean()),
    generatePasswordResetToken: zod_1.z.function().returns(zod_1.z.string()),
})
    .merge(exports.UserSchema);
