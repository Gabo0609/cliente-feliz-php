import { api, makeOfertaPayload } from "./helpers/testUtils.js";
import { pool } from "../src/db/pool.js";

afterAll(async () => {
  await pool.end();
});

describe("Postulaciones", () => {
  let ofertaId;
  let postulacionId;

  beforeAll(async () => {
    const r = await api()
      .post("/api/v1/ofertas")
      .send(makeOfertaPayload({ titulo: "Soporte" }));
    ofertaId = r.body.id;
  });

  test("POST /api/v1/postulaciones crea (upsert postulante)", async () => {
    const res = await api()
      .post("/api/v1/postulaciones")
      .send({
        oferta_id: ofertaId,
        postulante: {
          nombre: "Juan Pérez",
          email: "juan@example.com",
          telefono: "999-999-999",
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.postulacion).toBeDefined();
    postulacionId = res.body.postulacion.id;
  });

  test("PATCH /api/v1/postulaciones/:id/estado registra cambio", async () => {
    const res = await api()
      .patch(`/api/v1/postulaciones/${postulacionId}/estado`)
      .send({ estado_nuevo: "REVISANDO", comentario: "OK CV" });

    expect(res.status).toBe(200);
    expect(res.body.postulacion.estado).toBe("REVISANDO");
    expect(res.body.cambio.estado_nuevo).toBe("REVISANDO");
  });

  test("GET /api/v1/postulaciones/:id/cambios lista historial", async () => {
    const res = await api().get(
      `/api/v1/postulaciones/${postulacionId}/cambios`
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.cambios)).toBe(true);
    expect(res.body.postulacion.id).toBe(postulacionId);
  });

  test("GET /api/v1/ofertas/:id/postulantes lista por oferta", async () => {
    const res = await api().get(`/api/v1/ofertas/${ofertaId}/postulantes`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
