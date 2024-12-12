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
const user_model_js_1 = require("../../../database/models/user.model.js");
const remove_files_js_1 = require("../../lib/utils/remove-files.js");
const app_error_js_1 = __importDefault(require("../../lib/utils/app-error.js"));
const catch_async_js_1 = __importDefault(require("../../lib/utils/catch-async.js"));
const aggregate_api_js_1 = require("../../lib/utils/aggregate-api.js");
const validate_id_js_1 = __importDefault(require("../../lib/utils/validate-id.js"));
const handle_validation_js_1 = __importDefault(require("../../lib/utils/handle-validation.js"));
const user_schema_js_1 = require("../../lib/schemes/user.schema.js");
class UserHandlers {
    constructor() {
        this.getUsers = (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                { $project: { password: 0, wishlist: 0 } },
                ...(0, aggregate_api_js_1.searchPipe)(req, ["username", "email", "firstName", "lastName", "role"]),
                ...(0, aggregate_api_js_1.filterPipe)(req),
                ...(0, aggregate_api_js_1.sortPipe)(req),
                ...(0, aggregate_api_js_1.projectPipe)(req),
                ...(0, aggregate_api_js_1.paginatePipe)(req, "users"),
            ];
            const users = yield user_model_js_1.User.aggregate(pipeline);
            res.status(200).json({ status: "success", statusCode: 200, data: users[0] }).status(200);
        }));
        this.getUser = (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            (0, validate_id_js_1.default)(req.params.id);
            const user = yield user_model_js_1.User.findById(req.params.id, { wishlist: 0 });
            if (!user)
                return next(new app_error_js_1.default(`Couldn't find a user with an id of ${req.params.id}`, 404));
            res.status(200).json({ status: "success", statusCode: 200, data: { user } }).status(200);
        }));
        this.createUser = (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const candidate = (0, handle_validation_js_1.default)(user_schema_js_1.UserSchema.safeParse(req.body));
            // Only add the photo if it exists so that it doesn't overrides the default photo with blank one
            if (req.file)
                candidate.photo = req.file.filename;
            // Create the user
            const newUser = yield user_model_js_1.User.create(candidate);
            res.status(201).json({ status: "success", statusCode: 201, data: { newUser } });
        }));
        this.updateUser = (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            (0, validate_id_js_1.default)(req.params.id);
            // Prepare the user data
            const candidate = (0, handle_validation_js_1.default)(user_schema_js_1.UserSchema.partial().safeParse(req.body));
            // Only add the photo if it exists so that it doesn't overrides the default photo with blank one
            if (req.file) {
                candidate.photo = req.file.filename;
                const user = yield user_model_js_1.User.findById(req.params.id, { wishlist: 0 });
                // Remove old user photo from the storage
                (user === null || user === void 0 ? void 0 : user.photo) && (yield (0, remove_files_js_1.removeFiles)([user.photo], "public/images/users"));
            }
            // Update the user
            const updatedUser = yield user_model_js_1.User.findByIdAndUpdate(req.params.id, candidate, {
                new: true,
                runValidators: true,
                projection: { wishlist: 0 },
            });
            if (!updatedUser)
                return yield this.removeFilesAndHandleNotFound(req, res, next);
            res.status(200).json({ status: "success", statusCode: 200, data: { updatedUser } });
        }));
        this.deleteUser = (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            (0, validate_id_js_1.default)(req.params.id);
            const user = yield user_model_js_1.User.findByIdAndDelete(req.params.id);
            if (!user)
                return next(new app_error_js_1.default(`Couldn't find a user with an id of ${req.params.id}`, 404));
            res.status(204).json({ status: "success", statusCode: 204, data: null });
        }));
    }
    removeFilesAndHandleNotFound(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, remove_files_js_1.removeFilesWhenError)(req, res, next);
            return next(new app_error_js_1.default(`Couldn't find a user with an id of ${req.params.id}`, 404));
        });
    }
}
exports.default = UserHandlers;
