import express from "express";
import path from "path";
import helmet from "helmet";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";

import sanitize from "./middlewares/sanitize.middleware.js";
import Bootstrap from "./config/bootstrap.js";
import notFoundRouteMiddleware from "./middlewares/not-found-route.middleware.js";
import errorHandlingMiddleware from "./middlewares/error-handling.middleware.js";

export const app = express();

//# =============================================== SECURITY ===============================================
app.enable("trust proxy");

// Enable cors headers for all endpoints
const corsOptions: CorsOptions = {
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  allowedHeaders: ["Accept-Language", "Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
// Enable cors headers for options requests (requests the browser make as a pre-flight before delete&patch requests)
// Without this any patch/delete would probably not work on any endpoint
app.options("*", cors(corsOptions));

// Protect against HTTP Parameter Pollution attacks by always selecting the last param
app.use(hpp());

// Add necessary security headers using helmet middleware
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

// Convert all request bodies into JSON, limit the request size to 30MB
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Sanitize request body to prevent XSS attacks.
app.use(sanitize);

app.use(compression());
//# =============================================== /SECURITY ===============================================

// Allow access to any static files inside the public folder
const pathName = path.join(__dirname, "../", "public");

// Serve static files
app.use(express.static(pathName));

//* ================================================ ROUTES ================================================
Bootstrap(app);

app.use("*", notFoundRouteMiddleware);
app.use(errorHandlingMiddleware);

//* ================================================ /ROUTES ================================================
