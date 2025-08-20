import { Router } from "express";
import * as c from "../controllers/ofertas.controller.js";
import { validate } from "../middlewares/validators.js";

const r = Router();

// listar
r.get(
  "/ofertas",
  validate({
    query: {
      page: { type: "int", min: 1 },
      limit: { type: "int", min: 1, max: 100 },
      search: { type: "string", max: 150, trim: true },
      activas: { type: "boolean" }, // ?activas=true|false
    },
  }),
  c.listar
);

// crear
r.post(
  "/ofertas",
  validate({
    body: {
      titulo: { required: true, type: "string", min: 3, max: 150, trim: true },
      descripcion: { required: true, type: "string", min: 10, trim: true },
      location: { type: "string", min: 2, max: 120, trim: true },
    },
  }),
  c.crear
);

// PUT /:id  (update parcial/total)
r.put(
  "/ofertas/:id",
  validate({
    params: { id: { required: true, type: "int", min: 1 } },
    body: {
      titulo: { type: "string", min: 3, max: 150, trim: true },
      descripcion: { type: "string", min: 10, trim: true },
      location: { type: "string", min: 2, max: 120, trim: true },
      is_active: { type: "boolean" },
    },
  }),
  c.actualizar
);

// DELETE /:id  (soft delete)
r.delete(
  "/ofertas/:id",
  validate({ params: { id: { required: true, type: "int", min: 1 } } }),
  c.desactivar
);

// Listar ofertas de postulantes
r.get("/ofertas/:id/postulantes", c.listarPostulantes);

export default r;
