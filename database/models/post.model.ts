import { model, Schema } from "mongoose";
import { PostI } from "../../src/lib/schemes/post.schema";
import { Languages } from "../../src/lib/constants/languages";

const postSchema = new Schema<PostI>(
  {
    image: {
      type: String,
    },
    translations: [
      {
        language: {
          type: String,
          enum: Languages,
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
  },
  {
    timestamps: true,
  }
);

export const Post = model<PostI>("Post", postSchema);
