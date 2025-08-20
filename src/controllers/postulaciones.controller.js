import * as svc from "../services/postulaciones.service.js";

export async function crear(req, res, next) {
  try {
    const result = await svc.crearPostulacion(req.validated.body);
    return res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

export async function cambiarEstado(req, res, next) {
  try {
    const { id } = req.validated.params;
    const out = await svc.cambiarEstado(id, req.validated.body);
    return res.status(200).json(out);
  } catch (e) {
    next(e);
  }
}

export async function historial(req, res, next) {
  try {
    const { id } = req.params;
    const data = await svc.obtenerHistorial(Number(id));
    if (!data)
      return res
        .status(404)
        .json({ error: "NotFound", message: "Postulación no encontrada" });
    return res.json(data);
  } catch (e) {
    next(e);
  }
}
