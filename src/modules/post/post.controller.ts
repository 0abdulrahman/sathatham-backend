import { NextFunction, Request, Response } from "express";
import catchAsync from "../../lib/utils/catch-async";
import { PipelineStage, Types } from "mongoose";
import AggregateAPI, { filterPipe, paginatePipe, projectPipe, searchPipe, sortPipe, translatePipe } from "../../lib/utils/aggregate-api";
import { RESTResponse } from "../../lib/utils/rest-api-response";
import validateId from "../../lib/utils/validate-id";
import { Post } from "../../../database/models/post.model";
import { PostI, PostSchema } from "../../lib/schemes/post.schema";
import AppError from "../../lib/utils/app-error";
import handleValidation from "../../lib/utils/handle-validation";
import { saveFile } from "../upload/save-file";
import { removeFiles } from "../../lib/utils/remove-files";

export default class PostHandlers {
  getPosts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const pipeline: PipelineStage[] = [
      ...translatePipe(req),
      ...searchPipe(req, ["translations.data.title"]),
      ...filterPipe(req),
      ...sortPipe(req),
      ...projectPipe(req),
      ...paginatePipe(req, "posts"),
    ];

    const posts = await Post.aggregate(pipeline);

    return RESTResponse.success(posts[0], res);
  });

  getPost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    validateId(req.params.id);

    const API = new AggregateAPI<PostI>(Post.aggregate().match({ _id: new Types.ObjectId(req.params.id) }), req).translate().project();

    const posts = await API.aggregate;

    if (!posts?.length) return next(new AppError(`Couldn't find a post with an id of ${req.params.id}`, 404));

    return RESTResponse.success({ post: posts[0] }, res);
  });

  createPost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const newPost = handleValidation(PostSchema.safeParse(req.body));

    // Save the image from cache
    if (newPost.image) newPost.image = (await saveFile(newPost.image, "/posts")) as string;

    // Save the document in the database
    const post = await Post.create(newPost);

    return RESTResponse.created({ post }, res);
  });

  updatePost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    validateId(req.params.id);

    const postData = handleValidation(PostSchema.partial().safeParse(req.body));

    const post = await Post.findById(req.params.id);

    if (!post) return next(new AppError(`Couldn't find a post with an id of ${req.params.id}`, 404));

    if (postData.image) {
      // Move the new image from the cache to the storage folder
      const imagePath = (await saveFile(postData.image, "/posts")) as string;

      // Delete old image from the storage if it exists
      post.image && (await removeFiles([post.image], "public/images/posts"));

      // Save the new image in the data
      postData.image = imagePath;
    }
    console.log("22222222222222222222");

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, postData, { new: true });

    return RESTResponse.success({ post: updatedPost }, res);
  });

  deletePost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    validateId(req.params.id);

    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) return next(new AppError(`Couldn't find a post with an id of ${req.params.id}`, 404));

    return RESTResponse.deleted(res);
  });
}
