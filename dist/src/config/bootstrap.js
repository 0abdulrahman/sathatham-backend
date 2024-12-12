"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Bootstrap;
const upload_routes_1 = require("../modules/upload/upload.routes");
const auth_routes_1 = require("../modules/auth/auth.routes");
const user_routes_1 = require("../modules/user/user.routes");
const apiVersion = process.env.API_VERSION;
function Bootstrap(app) {
    app.use(apiVersion + "/upload", upload_routes_1.uploadRouter);
    app.use(apiVersion + "/auth", auth_routes_1.authRouter);
    app.use(apiVersion + "/users", user_routes_1.userRouter);
}
