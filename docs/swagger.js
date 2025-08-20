import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Cliente Feliz API",
      version: "1.0.0",
      description:
        "API para gestionar ofertas y postulaciones (con historial de estados).",
    },
    servers: [{ url: "http://localhost:5080/api/v1" }],
    components: {
      schemas: {
        OfertaInput: {
          type: "object",
          required: ["titulo", "descripcion"],
          properties: {
            titulo: { type: "string", minLength: 3, maxLength: 150 },
            descripcion: { type: "string", minLength: 10 },
            location: { type: "string" },
          },
        },
        Oferta: {
          allOf: [
            { $ref: "#/components/schemas/OfertaInput" },
            {
              type: "object",
              properties: {
                id: { type: "integer" },
                is_active: { type: "boolean" },
                created_at: { type: "string", format: "date-time" },
                updated_at: { type: "string", format: "date-time" },
              },
            },
          ],
        },
        PostulanteInput: {
          type: "object",
          required: ["nombre", "email"],
          properties: {
            nombre: { type: "string", minLength: 2 },
            email: { type: "string", format: "email" },
            telefono: { type: "string" },
          },
        },
        Postulacion: {
          type: "object",
          properties: {
            id: { type: "integer" },
            oferta_id: { type: "integer" },
            postulante_id: { type: "integer" },
            estado: {
              type: "string",
              enum: [
                "POSTULANDO",
                "REVISANDO",
                "ENTREVISTA_PSICO",
                "ENTREVISTA_PERSONAL",
                "SELECCIONADO",
                "DESCARTADO",
              ],
            },
            created_at: { type: "string", format: "date-time" },
          },
        },
        CambioEstadoInput: {
          type: "object",
          required: ["estado_nuevo"],
          properties: {
            estado_nuevo: {
              type: "string",
              enum: [
                "POSTULANDO",
                "REVISANDO",
                "ENTREVISTA_PSICO",
                "ENTREVISTA_PERSONAL",
                "SELECCIONADO",
                "DESCARTADO",
              ],
            },
            comentario: { type: "string", maxLength: 1000 },
          },
        },
        Cambio: {
          type: "object",
          properties: {
            id: { type: "integer" },
            postulacion_id: { type: "integer" },
            estado_nuevo: {
              $ref: "#/components/schemas/CambioEstadoInput/properties/estado_nuevo",
            },
            comentario: { type: "string" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
            details: { type: "array", items: { type: "object" } },
          },
        },
      },
      parameters: {
        IdParam: {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer", minimum: 1 },
        },
      },
    },
    paths: {
      "/health": {
        get: {
          summary: "Healthcheck",
          tags: ["Health"],
          responses: {
            200: { description: "OK" },
          },
        },
      },

      "/ofertas": {
        get: {
          summary: "Listar ofertas",
          tags: ["Ofertas"],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "integer", minimum: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", minimum: 1, maximum: 100 },
            },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "activas", in: "query", schema: { type: "boolean" } },
          ],
          responses: {
            200: {
              description: "Listado de ofertas",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Oferta" },
                  },
                },
              },
            },
            422: {
              description: "Validación",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
        post: {
          summary: "Crear oferta",
          tags: ["Ofertas"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OfertaInput" },
              },
            },
          },
          responses: {
            201: {
              description: "Creada",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Oferta" },
                },
              },
            },
            422: {
              description: "Validación",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },

      "/ofertas/{id}": {
        put: {
          summary: "Actualizar oferta",
          tags: ["Ofertas"],
          parameters: [{ $ref: "#/components/parameters/IdParam" }],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OfertaInput" },
              },
            },
          },
          responses: {
            200: {
              description: "Actualizada",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Oferta" },
                },
              },
            },
            404: { description: "No existe" },
            422: {
              description: "Validación",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
        delete: {
          summary: "Desactivar (soft delete) oferta",
          tags: ["Ofertas"],
          parameters: [{ $ref: "#/components/parameters/IdParam" }],
          responses: {
            204: { description: "Desactivada" },
            404: { description: "No existe" },
          },
        },
      },

      "/ofertas/{id}/postulantes": {
        get: {
          summary: "Listar postulantes de una oferta",
          tags: ["Ofertas"],
          parameters: [{ $ref: "#/components/parameters/IdParam" }],
          responses: {
            200: {
              description: "Listado",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        postulacion_id: { type: "integer" },
                        postulante_id: { type: "integer" },
                        nombre: { type: "string" },
                        email: { type: "string", format: "email" },
                        telefono: { type: "string" },
                        estado: {
                          $ref: "#/components/schemas/Postulacion/properties/estado",
                        },
                        postulacion_fecha: {
                          type: "string",
                          format: "date-time",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      "/postulaciones": {
        post: {
          summary: "Crear postulación (upsert postulante)",
          tags: ["Postulaciones"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["oferta_id", "postulante"],
                  properties: {
                    oferta_id: { type: "integer", minimum: 1 },
                    postulante: {
                      $ref: "#/components/schemas/PostulanteInput",
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Creada",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      postulacion: { $ref: "#/components/schemas/Postulacion" },
                      postulante: {
                        allOf: [
                          { $ref: "#/components/schemas/PostulanteInput" },
                          {
                            type: "object",
                            properties: { id: { type: "integer" } },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            404: { description: "Oferta no existe" },
            409: { description: "Duplicada (ya postuló a esa oferta)" },
            422: {
              description: "Validación",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },

      "/postulaciones/{id}/estado": {
        patch: {
          summary: "Cambiar estado de postulación (con historial)",
          tags: ["Postulaciones"],
          parameters: [{ $ref: "#/components/parameters/IdParam" }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CambioEstadoInput" },
              },
            },
          },
          responses: {
            200: {
              description: "Actualizada",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      postulacion: { $ref: "#/components/schemas/Postulacion" },
                      cambio: { $ref: "#/components/schemas/Cambio" },
                    },
                  },
                },
              },
            },
            404: { description: "No existe" },
            422: { description: "Estado inválido" },
          },
        },
      },

      "/postulaciones/{id}/cambios": {
        get: {
          summary: "Historial de una postulación",
          tags: ["Postulaciones"],
          parameters: [{ $ref: "#/components/parameters/IdParam" }],
          responses: {
            200: {
              description: "Historial",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      postulacion: { $ref: "#/components/schemas/Postulacion" },
                      cambios: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Cambio" },
                      },
                    },
                  },
                },
              },
            },
            404: { description: "No existe" },
          },
        },
      },
    },
  },

  apis: [],
});
