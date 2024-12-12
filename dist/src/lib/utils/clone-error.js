"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = cloneError;
function cloneError(error) {
    if (!(error instanceof Error)) {
        throw new Error("Parameter must be an instance of Error");
    }
    const clonedError = new Error(error.message);
    // Copy non-standard properties
    Object.getOwnPropertyNames(error).forEach((key) => {
        if (key !== "message" && key !== "stack") {
            clonedError[key] = error[key];
        }
    });
    clonedError.stack = error.stack;
    return clonedError;
}
