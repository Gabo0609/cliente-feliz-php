import { Router } from "express";
import { validate } from "../middlewares/validators.js";
import * as c from "../controllers/postulaciones.controller.js";

const r = Router();

const ESTADOS = [
  "POSTULANDO",
  "REVISANDO",
  "ENTREVISTA_PSICO",
  "ENTREVISTA_PERSONAL",
  "SELECCIONADO",
  "DESCARTADO",
];

r.post(
  "/postulaciones",
  // valida tipos básicos
  validate({
    body: {
      oferta_id: { required: true, type: "int", min: 1 },
      postulante: { required: true },
    },
  }),
  // validación del objeto postulante
  (req, res, next) => {
    const p = req.body.postulante;
    const errors = [];
    if (!p || typeof p !== "object")
      errors.push({ field: "body.postulante", message: "object required" });
    if (
      !p?.nombre ||
      typeof p.nombre !== "string" ||
      p.nombre.trim().length < 2
    )
      errors.push({ field: "body.postulante.nombre", message: "min length 2" });
    if (
      !p?.email ||
      typeof p.email !== "string" ||
      !/^\S+@\S+\.\S+$/.test(p.email)
    )
      errors.push({ field: "body.postulante.email", message: "invalid email" });
    if (p?.telefono && typeof p.telefono !== "string")
      errors.push({
        field: "body.postulante.telefono",
        message: "type string",
      });

    if (errors.length)
      return res.status(422).json({
        error: "ValidationError",
        message: "Invalid input",
        details: errors,
      });

    // normaliza y guarda en req.validated
    req.validated = req.validated || { body: {} };
    req.validated.body.oferta_id =
      req.validated.body.oferta_id ?? Number(req.body.oferta_id);
    req.validated.body.postulante = {
      nombre: p.nombre.trim(),
      email: p.email.trim(),
      telefono: p.telefono?.trim() || null,
    };
    next();
  },
  c.crear
);

// actualiza el estado de una postulación (ej: de "en revisión" a "aceptado") y guarda comentario en historial
r.patch(
  "/postulaciones/:id/estado",
  validate({
    params: { id: { required: true, type: "int", min: 1 } },
    body: {
      estado_nuevo: { required: true, type: "string", enum: ESTADOS },
      comentario: { type: "string", max: 1000 },
    },
  }),
  c.cambiarEstado
);

// devuelve la postulación con su historial de cambios de estado y comentarios
r.get("/postulaciones/:id/cambios", c.historial);

export default r;
