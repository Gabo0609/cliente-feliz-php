import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { logger } from "./utils/logger.js";

const PORT = process.env.PORT || 3000;
let server;

function startServer() {
  try {
    server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });

    server.on("error", (error) => {
      logger.error("Error al iniciar el servidor", err);
      process.exit(1);
    });
  } catch (err) {
    logger.error("Error inesperado al levantar el servidor:", err);
    process.exit(1);
  }

  process.on("uncaughtException", (err) => {
    logger.error("Unhandled Exception:", err);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection en:", promise, "razón:", reason);
    process.exit(1);
  });
}

startServer();
