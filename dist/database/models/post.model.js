"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const mongoose_1 = require("mongoose");
const languages_1 = require("../../src/lib/constants/languages");
const postSchema = new mongoose_1.Schema({
    image: {
        type: String,
    },
    translations: [
        {
            language: {
                type: String,
                enum: languages_1.Languages,
                required: [true, "Translation language is required"],
            },
            data: {
                title: {
                    type: String,
                    required: [true, "Post title is required"],
                },
                content: {
                    type: String,
                    required: [true, "Post content is required"],
                },
            },
        },
    ],
}, {
    timestamps: true,
});
exports.Post = (0, mongoose_1.model)("Post", postSchema);
