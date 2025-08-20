import { api, makeOfertaPayload } from "./helpers/testUtils.js";
import { pool } from "../src/db/pool.js";

afterAll(async () => {
  await pool.end();
});

describe("Ofertas", () => {
  let createdId;

  test("POST /api/v1/ofertas crea oferta", async () => {
    const res = await api().post("/api/v1/ofertas").send(makeOfertaPayload());
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    createdId = res.body.id;
  });

  test("GET /api/v1/ofertas lista", async () => {
    const res = await api().get("/api/v1/ofertas?activas=true&page=1&limit=5");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("PUT /api/v1/ofertas/:id actualiza", async () => {
    const res = await api()
      .put(`/api/v1/ofertas/${createdId}`)
      .send({ titulo: "Agente Senior" });
    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe("Agente Senior");
  });

  test("DELETE /api/v1/ofertas/:id desactiva (soft)", async () => {
    const res = await api().delete(`/api/v1/ofertas/${createdId}`);
    expect(res.status).toBe(204);
  });
});
