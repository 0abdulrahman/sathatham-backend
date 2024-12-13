import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { Languages } from "../constants/languages";

export const PostSchema = z.object({
  image: z.string().optional(),
  translations: z.array(
    z.object({
      language: z.nativeEnum(Languages),
      data: z.object({
        title: z.string({ required_error: "Post title is required!" }),
        content: z.string({ required_error: "Post description is required!" }),
      }),
    })
  ),
});

export const DocumentSchema = z
  .object({
    _id: z.custom((val) => isValidObjectId(val)),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .merge(PostSchema);

export type PostI = z.infer<typeof DocumentSchema>;
