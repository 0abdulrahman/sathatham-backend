import { model, Query, Schema } from "mongoose";

import crypto from "crypto";
import { ROLE } from "../../src/lib/constants/roles";
import { UserI } from "../../src/lib/schemes/user.schema";
import { removeFiles } from "../../src/lib/utils/remove-files";
import bcrypt from "bcrypt";
const userSchema = new Schema<UserI>(
  {
    username: {
      type: String,
      required: [true, "Username is required!"],
      unique: true,
      trim: true,
      minLength: [3, "Username must be at least 3 characters!"],
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
        validator: function (el: string): boolean {
          return el === (this as any).password;
        },
        message: "Passwords don't match!",
      },
    },
    firstName: {
      type: String,
      required: [true, "First name is required!"],
      trim: true,
      minLength: [2, "First name must be at least 2 characters long!"],
    },
    familyName: {
      type: String,
      required: [true, "Family name is required!"],
      trim: true,
      minLength: [2, "Family name must be at least 2 characters long!"],
    },
    sex: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Student sex is required"],
    },
    role: {
      type: String,
      enum: [ROLE.MANAGER, ROLE.MODERATOR, ROLE.TEACHER, ROLE.STUDENT],
      default: ROLE.STUDENT,
    },
    photo: {
      type: String,
    },
    studentData: {
      approved: {
        type: Boolean,
        default: false,
      },
      studentNumber: {
        type: Number,
      },
      IDNumber: {
        type: String,
      },
      class: {
        type: String,
      },
      GPA: {
        type: Number,
        min: [0, "GPA number is invalid"],
      },
      fatherName: {
        type: String,
      },
      motherName: {
        type: String,
      },
      contactInformation: {
        type: String,
      },
      birthDate: {
        type: Date,
      },
      nationality: {
        type: String,
      },
      address: {
        type: String,
      },
      report: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", async function (this, next) {
  // Only run this function if the password has been modified to avoid running it if any other field is modified
  if (!this.isModified("password")) return next();

  // Hash the password before saving it to the database
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the password confirmation field before saving the document
  (this.passwordConfirm as any) = undefined;

  // Run the next middleware
  next();
});

// Create a virtual property `fullName` with a getter and setter.
userSchema.virtual("fullName").get(function (this: UserI) {
  return `${this.firstName} ${this.familyName}`;
});

const handleUserDelete = async function (this: Query<UserI[], UserI>, next: (err?: Error) => void) {
  try {
    const user: UserI | null = await this.model.findOne(this.getFilter());

    if (user?.photo && !user.photo.endsWith("default-user.jpg")) {
      // Remove user photo
      await removeFiles([user.photo], "public/images/users");
    }

    // Proceed to deleting the user after successfully deleting the photo
    next();
  } catch (error) {
    // Stop the deletion if removing the photo fails
    next(error instanceof Error ? error : new Error(String(error)));
  }
};

// Apply the middleware to both deleteOne and findOneAndDelete
userSchema.pre("deleteOne", handleUserDelete);
userSchema.pre("findOneAndDelete", handleUserDelete);

userSchema.pre("deleteMany", async function (this: Query<UserI[], UserI>, next) {
  try {
    const users: UserI[] = await this.model.find(this.getFilter());

    // Gather all users' photos in a single array
    const imagesPaths = users.map((u) => u.photo).filter(Boolean) as string[];

    // Remove useres photos
    if (imagesPaths.length) await removeFiles(imagesPaths, "public/images/users");

    // Proceed to deleting the users after successfully deleting the photos
    next();
  } catch (error) {
    // Stop the deletion if removing any photo fails
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

/**
 * Generates a password-reset token, ecrypts it and saves it in the user's schema then returns the plain (unencrypted) token.
 * @returns the unencrypted `token`.
 */
userSchema.methods.generatePasswordResetToken = function () {
  // Generate the token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Encrypt the token (built-in crypto is enough since this is less dangerous token to be exposed)
  // We're encrypting because it's dangerous to save it in the DB without hashing it like the password
  const ecryptedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  this.passwordResetToken = ecryptedToken;
  // Make the token expire after 60 minutes
  this.passwordResetExpiration = Date.now() + 60 * 60 * 1000;

  return resetToken;
};

export const User = model<UserI>("User", userSchema);
