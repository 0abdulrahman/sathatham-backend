import { dbConnection } from "../database/db-connection";
import { app } from "./app";

// Handle any synchronous error and crash the server immediately if it happened.
// => This event listener is placed at the very top to listen for all errors that might happen after,
//    any error that occurs before this listener will not be handeled.
process.on("uncaughtException", (err: Error) => {
  console.log("💥💥💥 UNHANDLED EXCEPTION! Shutting down...");
  console.log(err);

  // Shutdown the application, we don't need to wait since this is a sync operation not async.
  process.exit(1);
});

const port = process.env.PORT;

const server = app.listen(port, async () => {
  await dbConnection;
  console.log(`💿 The server is running on port ${port}!`);
});

// Handle any promise-rejection errors, such as a fail connection to the database
process.on("unhandledRejection", (err: Error) => {
  console.log("💥💥💥 UNHANDLED REJECTION! Shutting down...");
  console.log(err);

  // Shutdown the application after waiting for all the requests to be handeled.
  server.close(() => {
    process.exit(1);
  });
});
