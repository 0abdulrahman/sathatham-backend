"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const validator_1 = __importDefault(require("validator"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const roles_1 = require("../../src/lib/constants/roles");
const remove_files_1 = require("../../src/lib/utils/remove-files");
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: [true, "Username is required!"],
        unique: true,
        trim: true,
        minLength: [3, "Username must be at least 3 characters!"],
    },
    email: {
        type: String,
        required: [true, "Email is required!"],
        unique: true,
        trim: true,
        validate: [validator_1.default.isEmail, "Invalid email address!"],
    },
    password: {
        type: String,
        required: [true, "Password is required!"],
        minlength: [8, "Password must be at least 8 characters long!"],
        // Never show the password in any output/retrieval
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, "Password confirmation is required!"],
        // This validation only works on CREATE/SAVE
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: "Passwords don't match!",
        },
    },
    firstName: {
        type: String,
        required: [true, "First name is required!"],
        trim: true,
        minLength: [3, "First name must be at least 3 characters long!"],
    },
    lastName: {
        type: String,
        trim: true,
        minLength: [3, "Last name must be at least 3 characters long!"],
    },
    role: {
        type: String,
        enum: [roles_1.ROLE.MANAGER, roles_1.ROLE.MODERATOR, roles_1.ROLE.TEACHER, roles_1.ROLE.STUDENT],
        default: roles_1.ROLE.STUDENT,
    },
    photo: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
    blocked: {
        type: Boolean,
        default: false,
    },
    passwordChangeDate: {
        type: Date,
    },
    wishlist: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Product",
            default: [],
        },
    ],
    passwordResetToken: {
        type: String,
    },
    passwordResetExpiration: {
        type: Date,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // Only run this function if the password has been modified to avoid running it if any other field is modified
        if (!this.isModified("password"))
            return next();
        // Hash the password before saving it to the database
        this.password = yield bcrypt_1.default.hash(this.password, 12);
        // Delete the password confirmation field before saving the document
        this.passwordConfirm = undefined;
        // If this isn't a new document (updating not creating), change the password change-date to compare it later with the token expiration-date,
        // and substract 1 second to make sure the token issuance-date is newer than the password change-date
        if (!this.isNew)
            this.passwordChangeDate = Date.now() - 1000;
        // Run the next middleware
        next();
    });
});
// Apply this middleware to all `find` queries
userSchema.pre(/^find/, function () {
    // `this` refers to the find query
    this.find({ active: { $ne: false } });
});
// Create a virtual property `fullName` with a getter and setter.
userSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});
const handleUserDelete = function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield this.model.findOne(this.getFilter());
            if ((user === null || user === void 0 ? void 0 : user.photo) && !user.photo.endsWith("default-user.jpg")) {
                // Remove user photo
                yield (0, remove_files_1.removeFiles)([user.photo], "public/images/users");
            }
            // Proceed to deleting the user after successfully deleting the photo
            next();
        }
        catch (error) {
            // Stop the deletion if removing the photo fails
            next(error instanceof Error ? error : new Error(String(error)));
        }
    });
};
// Apply the middleware to both deleteOne and findOneAndDelete
userSchema.pre("deleteOne", handleUserDelete);
userSchema.pre("findOneAndDelete", handleUserDelete);
userSchema.pre("deleteMany", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = yield this.model.find(this.getFilter());
            // Gather all users' photos in a single array
            const imagesPaths = users.map((u) => u.photo).filter(Boolean);
            // Remove useres photos
            if (imagesPaths.length)
                yield (0, remove_files_1.removeFiles)(imagesPaths, "public/images/users");
            // Proceed to deleting the users after successfully deleting the photos
            next();
        }
        catch (error) {
            // Stop the deletion if removing any photo fails
            next(error instanceof Error ? error : new Error(String(error)));
        }
    });
});
/**
 * Checks if the password has been changed after the JWT token was issued.
 * @param JWTTimestamp - The timestamp of the JWT token issuance.
 * @returns `true` if the password was changed after the token was issued, otherwise `false`.
 */
userSchema.methods.passwordChangedAfterToken = function (JWTTimestamp) {
    // If the passwordChangeDate property doesn't exist on the user's document, it means they have never changed their password yet.
    if (!this.passwordChangeDate)
        return false;
    // Return the result of checking whether the token issue-date is before the password change-date
    return JWTTimestamp < this.passwordChangeDate;
};
/**
 * Generates a password-reset token, ecrypts it and saves it in the user's schema then returns the plain (unencrypted) token.
 * @returns the unencrypted `token`.
 */
userSchema.methods.generatePasswordResetToken = function () {
    // Generate the token
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    // Encrypt the token (built-in crypto is enough since this is less dangerous token to be exposed)
    // We're encrypting because it's dangerous to save it in the DB without hashing it like the password
    const ecryptedToken = crypto_1.default.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetToken = ecryptedToken;
    // Make the token expire after 60 minutes
    this.passwordResetExpiration = Date.now() + 60 * 60 * 1000;
    return resetToken;
};
exports.User = (0, mongoose_1.model)("User", userSchema);
