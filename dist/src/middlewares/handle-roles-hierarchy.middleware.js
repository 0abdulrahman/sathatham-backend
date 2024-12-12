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
exports.handleRolesHierarchy = void 0;
const roles_js_1 = require("../lib/constants/roles.js");
const catch_async_js_1 = __importDefault(require("../lib/utils/catch-async.js"));
const app_error_js_1 = __importDefault(require("../lib/utils/app-error.js"));
const user_model_js_1 = require("../../database/models/user.model.js");
/**
 * Middleware to handle role-based access control by comparing the roles of the current user and the target user.
 * Ensures that users cannot perform actions on other users with equal or higher roles.
 *
 * @param {RequestType} req - The Express request object, extended with user role information.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @throws {AppError} Throws an error with a 403 status code if the current user has insufficient permissions.
 */
exports.handleRolesHierarchy = (0, catch_async_js_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Define role hierarchy with power levels
    const roles = [
        { role: roles_js_1.ROLE.MANAGER, power: 999999999999999 },
        { role: roles_js_1.ROLE.MODERATOR, power: 3 },
        { role: roles_js_1.ROLE.TEACHER, power: 1 },
        { role: roles_js_1.ROLE.STUDENT, power: 1 },
    ];
    // Get the role of the current user and the target user
    const currentUserRole = req.user.role;
    let targetUserRole;
    // If the target user id exists, look for it in the database
    if (req.params.id) {
        const targetUser = yield user_model_js_1.User.findById(req.params.id);
        if (!targetUser)
            return next(new app_error_js_1.default(`Couldn't find a user with an id of ${req.params.id}`, 404));
        targetUserRole = targetUser.role;
    }
    else {
        // If it doesn't, use the `role` specified in the req.body or use the `USER` role as a fallback
        targetUserRole = req.body.role || roles_js_1.ROLE.STUDENT;
    }
    // Find the power levels for the current and target users
    const currentUserPower = roles.find((el) => el.role === currentUserRole).power;
    const targetUserPower = (_a = roles.find((el) => el.role === targetUserRole)) === null || _a === void 0 ? void 0 : _a.power;
    if (!targetUserPower)
        return next(new app_error_js_1.default("The specified role is not a valid role!", 400));
    // Check if the current user has sufficient permissions
    if (currentUserPower === targetUserPower) {
        return next(new app_error_js_1.default("You cannot create, update or delete a user whose role is the same as you!", 403));
    }
    else if (currentUserPower < targetUserPower) {
        return next(new app_error_js_1.default("You cannot create, update or delete a user whose role is higher than you!", 403));
    }
    // If the current user has sufficient permissions, proceed to the next middleware
    next();
}));
