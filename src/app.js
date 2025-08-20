import express from "express";
import cors from "cors";
import { httpLogger } from "./utils/logger.js";

import healthRoutes from "./routes/health.routes.js";
import ofertasRoutes from "./routes/ofertas.routes.js";
import postulacionesRoutes from "./routes/postulaciones.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

//Documentación Swagger
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../docs/swagger.js";

const app = express();

//middlewares globales
app.use(cors());
app.use(express.json());
app.use(httpLogger);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//rutas
app.use("/api/v1", healthRoutes);
app.use("/api/v1", ofertasRoutes);
app.use("/api/v1", postulacionesRoutes);

//middleware de error
app.use(errorHandler);

export default app;
