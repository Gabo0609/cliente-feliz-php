// src/db/tx.js
import { pool } from "./pool.js";
import { logger } from "../utils/logger.js";

export async function withTx(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const res = await fn(client);
    await client.query("COMMIT");
    return res;
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (rbErr) {
      logger.error("Falló el ROLLBACK:", rbErr);
    }
    throw err;
  } finally {
    client.release();
  }
}
