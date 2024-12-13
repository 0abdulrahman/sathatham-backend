"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentSchema = exports.PostSchema = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
const languages_1 = require("../constants/languages");
exports.PostSchema = zod_1.z.object({
    image: zod_1.z.string().optional(),
    translations: zod_1.z.array(zod_1.z.object({
        language: zod_1.z.nativeEnum(languages_1.Languages),
        data: zod_1.z.object({
            title: zod_1.z.string({ required_error: "Post title is required!" }),
            content: zod_1.z.string({ required_error: "Post description is required!" }),
        }),
    })),
});
exports.DocumentSchema = zod_1.z
    .object({
    _id: zod_1.z.custom((val) => (0, mongoose_1.isValidObjectId)(val)),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
})
    .merge(exports.PostSchema);
