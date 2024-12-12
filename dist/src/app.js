"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const sanitize_middleware_js_1 = __importDefault(require("./middlewares/sanitize.middleware.js"));
const bootstrap_js_1 = __importDefault(require("./config/bootstrap.js"));
const not_found_route_middleware_js_1 = __importDefault(require("./middlewares/not-found-route.middleware.js"));
const error_handling_middleware_js_1 = __importDefault(require("./middlewares/error-handling.middleware.js"));
exports.app = (0, express_1.default)();
//# =============================================== SECURITY ===============================================
// TODO: Add protection against CSRF attack and add a logger
// TODO: Newest compounds should be the newest 3 compounds of each developer
// * Review functionality of every handler
// * Make an endpoint for site stats.
// * Make the images path same as Khaleds
// * Add the images path when saving it in the user DOC
// * Pagination, filter, sort should be added to approperiate endpoints throughout the application
// * Handle bad id param error for everything;
// * Delete the document images on each collection when it gets deleted
// * Add endpoints to delete compound and property images
exports.app.enable("trust proxy");
// Enable cors headers for all endpoints
const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:5173", "https://thelanerealestate.com", "https://admin.thelanerealestate.com"],
    credentials: true,
    allowedHeaders: ["Accept-Language", "Content-Type", "Authorization"],
};
exports.app.use((0, cors_1.default)(corsOptions));
// Enable cors headers for options requests (requests the browser make as a pre-flight before delete&patch requests)
// Without this any patch/delete would probably not work on any endpoint
exports.app.options("*", (0, cors_1.default)(corsOptions));
// Protect against HTTP Parameter Pollution attacks by always selecting the last param
exports.app.use((0, hpp_1.default)());
// Add necessary security headers using helmet middleware
exports.app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: {
        policy: "cross-origin",
    },
}));
// Convert all request bodies into JSON, limit the request size to 30MB
exports.app.use(express_1.default.json({ limit: "30mb" }));
exports.app.use(express_1.default.urlencoded({ extended: true, limit: "30mb" }));
exports.app.use((0, cookie_parser_1.default)());
// Data sanitization against NoSQL query injection
exports.app.use((0, express_mongo_sanitize_1.default)());
// Sanitize request body to prevent XSS attacks.
exports.app.use(sanitize_middleware_js_1.default);
exports.app.use((0, compression_1.default)());
//# =============================================== /SECURITY ===============================================
// Allow access to any static files inside the public folder
// Derive __dirname equivalent
const pathName = path_1.default.join(__dirname, "public");
exports.app.use(express_1.default.static(pathName));
//* ================================================ ROUTES ================================================
(0, bootstrap_js_1.default)(exports.app);
exports.app.use("*", not_found_route_middleware_js_1.default);
exports.app.use(error_handling_middleware_js_1.default);
//* ================================================ /ROUTES ================================================
