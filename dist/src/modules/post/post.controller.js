"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const catch_async_1 = __importDefault(require("../../lib/utils/catch-async"));
const mongoose_1 = require("mongoose");
const aggregate_api_1 = __importStar(require("../../lib/utils/aggregate-api"));
const rest_api_response_1 = require("../../lib/utils/rest-api-response");
const validate_id_1 = __importDefault(require("../../lib/utils/validate-id"));
const post_model_1 = require("../../../database/models/post.model");
const post_schema_1 = require("../../lib/schemes/post.schema");
const app_error_1 = __importDefault(require("../../lib/utils/app-error"));
const handle_validation_1 = __importDefault(require("../../lib/utils/handle-validation"));
const save_file_1 = require("../upload/save-file");
const remove_files_1 = require("../../lib/utils/remove-files");
class PostHandlers {
    constructor() {
        this.getPosts = (0, catch_async_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                ...(0, aggregate_api_1.translatePipe)(req),
                ...(0, aggregate_api_1.searchPipe)(req, ["translations.data.title"]),
                ...(0, aggregate_api_1.filterPipe)(req),
                ...(0, aggregate_api_1.sortPipe)(req),
                ...(0, aggregate_api_1.projectPipe)(req),
                ...(0, aggregate_api_1.paginatePipe)(req, "posts"),
            ];
            const posts = yield post_model_1.Post.aggregate(pipeline);
            return rest_api_response_1.RESTResponse.success(posts[0], res);
        }));
        this.getPost = (0, catch_async_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            (0, validate_id_1.default)(req.params.id);
            const API = new aggregate_api_1.default(post_model_1.Post.aggregate().match({ _id: new mongoose_1.Types.ObjectId(req.params.id) }), req).translate().project();
            const posts = yield API.aggregate;
            if (!(posts === null || posts === void 0 ? void 0 : posts.length))
                return next(new app_error_1.default(`Couldn't find a post with an id of ${req.params.id}`, 404));
            return rest_api_response_1.RESTResponse.success({ post: posts[0] }, res);
        }));
        this.createPost = (0, catch_async_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const newPost = (0, handle_validation_1.default)(post_schema_1.PostSchema.safeParse(req.body));
            // Save the image from cache
            if (newPost.image)
                newPost.image = (yield (0, save_file_1.saveFile)(newPost.image, "/posts"));
            // Save the document in the database
            const post = yield post_model_1.Post.create(newPost);
            return rest_api_response_1.RESTResponse.created({ post }, res);
        }));
        this.updatePost = (0, catch_async_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            (0, validate_id_1.default)(req.params.id);
            const postData = (0, handle_validation_1.default)(post_schema_1.PostSchema.partial().safeParse(req.body));
            const post = yield post_model_1.Post.findById(req.params.id);
            if (!post)
                return next(new app_error_1.default(`Couldn't find a post with an id of ${req.params.id}`, 404));
            if (postData.image) {
                // Move the new image from the cache to the storage folder
                const imagePath = (yield (0, save_file_1.saveFile)(postData.image, "/posts"));
                // Delete old image from the storage if it exists
                post.image && (yield (0, remove_files_1.removeFiles)([post.image], "public/images/posts"));
                // Save the new image in the data
                postData.image = imagePath;
            }
            console.log("22222222222222222222");
            const updatedPost = yield post_model_1.Post.findByIdAndUpdate(req.params.id, postData, { new: true });
            return rest_api_response_1.RESTResponse.success({ post: updatedPost }, res);
        }));
        this.deletePost = (0, catch_async_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            (0, validate_id_1.default)(req.params.id);
            const post = yield post_model_1.Post.findByIdAndDelete(req.params.id);
            if (!post)
                return next(new app_error_1.default(`Couldn't find a post with an id of ${req.params.id}`, 404));
            return rest_api_response_1.RESTResponse.deleted(res);
        }));
    }
}
exports.default = PostHandlers;
