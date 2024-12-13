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
const rest_api_response_js_1 = require("../../lib/utils/rest-api-response.js");
const roles_js_1 = require("../../lib/constants/roles.js");
class UserHandlers {
    constructor() {
        this.getUsers = (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                { $project: { password: 0 } },
                ...(0, aggregate_api_js_1.searchPipe)(req, ["username", "firstName", "lastName", "role", "student.studentNumber", "student.IDNumber"]),
                ...(0, aggregate_api_js_1.filterPipe)(req),
                ...(0, aggregate_api_js_1.sortPipe)(req),
                ...(0, aggregate_api_js_1.projectPipe)(req),
                ...(0, aggregate_api_js_1.paginatePipe)(req, "users"),
            ];
            const users = yield user_model_js_1.User.aggregate(pipeline);
            rest_api_response_js_1.RESTResponse.success(users[0], res);
        }));
        this.getUser = (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            (0, validate_id_js_1.default)(req.params.id);
            const user = yield user_model_js_1.User.findById(req.params.id);
            if (!user)
                return next(new app_error_js_1.default(`Couldn't find a user with an id of ${req.params.id}`, 404));
            rest_api_response_js_1.RESTResponse.success({ user }, res);
        }));
        this.createUser = (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const candidate = (0, handle_validation_js_1.default)(user_schema_js_1.UserSchema.safeParse(req.body));
            // Only add the photo if it exists so that it doesn't overrides the default photo with blank one
            if (req.file)
                candidate.photo = req.file.filename;
            // Create the user
            const newUser = yield user_model_js_1.User.create(candidate);
            rest_api_response_js_1.RESTResponse.created({ newUser }, res);
        }));
        this.updateUser = (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            (0, validate_id_js_1.default)(req.params.id);
            // Only allow `report` field to be modified if the user is a teacher
            if (req.user.role === roles_js_1.ROLE.TEACHER)
                req.body = { studentData: { report: (_a = req.body.studentData) === null || _a === void 0 ? void 0 : _a.report } };
            // Prepare the user data
            const userData = (0, handle_validation_js_1.default)(user_schema_js_1.UserSchema.deepPartial().safeParse(req.body));
            // Only add the photo if it exists so that it doesn't overrides the default photo with blank one
            if (req.file) {
                userData.photo = req.file.filename;
                const user = yield user_model_js_1.User.findById(req.params.id);
                // Remove old user photo from the storage
                (user === null || user === void 0 ? void 0 : user.photo) && (yield (0, remove_files_js_1.removeFiles)([user.photo], "public/images/users"));
            }
            // Update the user
            const updatedUser = yield user_model_js_1.User.findByIdAndUpdate(req.params.id, userData, {
                new: true,
                runValidators: true,
            });
            if (!updatedUser)
                return yield this.removeFilesAndHandleNotFound(req, res, next);
            rest_api_response_js_1.RESTResponse.success({ updatedUser }, res);
        }));
        this.deleteUser = (0, catch_async_js_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            (0, validate_id_js_1.default)(req.params.id);
            const user = yield user_model_js_1.User.findByIdAndDelete(req.params.id);
            if (!user)
                return next(new app_error_js_1.default(`Couldn't find a user with an id of ${req.params.id}`, 404));
            rest_api_response_js_1.RESTResponse.deleted(res);
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
