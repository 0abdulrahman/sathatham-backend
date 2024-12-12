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
const db_connection_1 = require("../database/db-connection");
const app_1 = require("./app");
// Handle any synchronous error and crash the server immediately if it happened.
// => This event listener is placed at the very top to listen for all errors that might happen after,
//    any error that occurs before this listener will not be handeled.
process.on("uncaughtException", (err) => {
    console.log("💥💥💥 UNHANDLED EXCEPTION! Shutting down...");
    console.log(err);
    // Shutdown the application, we don't need to wait since this is a sync operation not async.
    process.exit(1);
});
const port = process.env.PORT;
const server = app_1.app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    yield db_connection_1.dbConnection;
    console.log(`💿 The server is running on port ${port}!`);
}));
// Handle any promise-rejection errors, such as a fail connection to the database
process.on("unhandledRejection", (err) => {
    console.log("💥💥💥 UNHANDLED REJECTION! Shutting down...");
    console.log(err);
    // Shutdown the application after waiting for all the requests to be handeled.
    server.close(() => {
        process.exit(1);
    });
});
