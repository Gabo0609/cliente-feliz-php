import pkg from "pg";
import dotenv from "dotenv";
import { logger } from "../utils/logger.js";

dotenv.config();
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // maximo de conexiones en el pool
});

// evento para cuando se conecta exitosamente
pool.on("connect", () => {
  logger.info("✅ Conectado a la base de datos PostgreSQL");
});

// evento para poder manejar errores inesperados
pool.on("error", (err) => {
  logger.error("❌ Error inesperado en el pool de la base de datos", err);
  process.exit(-1);
});
