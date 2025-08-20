import * as svc from "../services/ofertas.service.js";

export async function crear(req, res, next) {
  try {
    const oferta = await svc.crearOferta(req.validated.body);
    return res.status(201).json(oferta);
  } catch (e) {
    next(e);
  }
}

export async function listar(req, res, next) {
  try {
    const q = req.validated?.query || {};
    if (typeof q.activas === "string") q.activas = q.activas === "true"; // por si viene como string
    const data = await svc.listarOfertas(q);
    return res.status(200).json(data);
  } catch (e) {
    next(e);
  }
}

export async function actualizar(req, res, next) {
  try {
    const { id } = req.validated.params;
    const updated = await svc.actualizarOferta(id, req.validated.body);
    if (!updated)
      return res
        .status(404)
        .json({ error: "NotFound", message: "Oferta no encontrada" });
    return res.status(200).json(updated);
  } catch (e) {
    next(e);
  }
}

export async function desactivar(req, res, next) {
  try {
    const { id } = req.validated.params;
    const ok = await svc.desactivarOferta(id);
    if (!ok)
      return res
        .status(404)
        .json({ error: "NotFound", message: "Oferta no encontrada" });
    return res.status(204).send();
  } catch (e) {
    next(e);
  }
}

export async function listarPostulantes(req, res, next) {
  try {
    const { id } = req.params;
    const data = await svc.listarPostulantesDeOferta(Number(id));
    return res.json(data);
  } catch (e) {
    next(e);
  }
}
