import morgan from "morgan";

const format = process.env.NODE_ENV === "production" ? "combined" : "dev";

export const httpLogger = morgan(format);

export const logger = {
  info: (...args) => console.log("[INFO]:", ...args),
  warn: (...args) => console.warn("[WARN]:", ...args),
  error: (...args) => console.error("[ERROR]:", ...args),
  debug: (...args) => {
    if (process.env.NODE_ENV === "development") {
      console.debug("[DEBUG]:", ...args);
    }
  },
};
