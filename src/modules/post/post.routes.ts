import { Router } from "express";
import PostHandlers from "./post.controller";
import authenticate from "../../middlewares/authenticate.middleware";
import authorize from "../../middlewares/authorize.middleware";
import { ROLE } from "../../lib/constants/roles";

export const postRouter = Router();
const postHandlers = new PostHandlers();

postRouter.get("/", postHandlers.getPosts);

postRouter.get("/:id", postHandlers.getPost);

postRouter.use(authenticate, authorize(ROLE.MANAGER, ROLE.MODERATOR));

postRouter.post("/", postHandlers.createPost);

postRouter.route("/:id").patch(postHandlers.updatePost).delete(postHandlers.deletePost);
