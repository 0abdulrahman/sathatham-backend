"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = catchAsync;
/**
 * Wraps an async function and catches any errors that occur,
 * passing them to the error-handling middleware via the `next` function.
 *
 * This utility is used to simplify error handling for async route handlers
 * in a Node.js application using the Express framework.
 *
 * @param {function} asyncFunction - The async handler function to be wrapped.
 * @returns {function} A new function that wraps the async function with error catching.
 */
function catchAsync(asyncFunction) {
    return (req, res, next) => {
        /*
          When calling `next` with an argument, Express assumes that it's an error since nothing gets passed into `next` as an argument
          except for errors, and then ignores all middlewares in the stack and fires the global error-handling middleware
        */
        asyncFunction(req, res, next).catch((err) => __awaiter(this, void 0, void 0, function* () {
            // Fire the global error-handling middleware with the error object.
            next(err);
        }));
    };
}
