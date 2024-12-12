"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.dbConnection = mongoose_1.default
    .connect(process.env.MONGODB_URI, {
    dbName: "e-commerce",
})
    .then(() => console.log("🟢 Successfully connected to the database!"));
