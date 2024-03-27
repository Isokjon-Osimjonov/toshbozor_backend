const app = require("./app");
const initCronJob = require("./src/helpers/clearExpiredFiledsCron");
const { PORT } = require("./src/config/environments.config");

const { databaseConnection } = require("./src/config/db.config");

const server = app.listen(PORT, async () => {
  try {
    console.log(`Server running on port: ${PORT} 🚀`);
    await databaseConnection();
    initCronJob();
  } catch (err) {
    console.error(`Error starting server: ${err.message}`);
    process.exit(1);
  }
});

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  console.error(err.stack);
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

const shutdown = () => {
  console.log("Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
