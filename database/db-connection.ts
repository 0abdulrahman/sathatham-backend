import mongoose from "mongoose";

export const dbConnection = mongoose
  .connect(process.env.MONGODB_URI!, {
    dbName: "sathatham",
  })
  .then(() => console.log("🟢 Successfully connected to the database!"));
