import request from "supertest";
import app from "../../src/app.js";

export const api = () => request(app);

export const makeOfertaPayload = (over = {}) => ({
  titulo: "Agente",
  descripcion: "Atender clientes", // >= 10 chars para no romper el validador
  location: "Santiago",
  ...over,
});
