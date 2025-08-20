/* eslint-disable */

/**
 * init_schema:
 * - Enum estado_postulacion
 * - Tablas: ofertas, postulantes, postulaciones, cambios_estado
 * - FKs, unique compuesto, soft delete, trigger updated_at, índices
 */

export const up = (pgm) => {
  // 1) Enum de estados
  pgm.createType("estado_postulacion", [
    "POSTULANDO",
    "REVISANDO",
    "ENTREVISTA_PSICO",
    "ENTREVISTA_PERSONAL",
    "SELECCIONADO",
    "DESCARTADO",
  ]);

  // 2) Ofertas (soft delete con is_active)
  pgm.createTable("ofertas", {
    id: "id",
    titulo: { type: "varchar(150)", notNull: true },
    descripcion: { type: "text", notNull: true },
    location: { type: "varchar(120)" },
    is_active: { type: "boolean", notNull: true, default: true },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  // 3) Postulantes (email único)
  pgm.createTable("postulantes", {
    id: "id",
    nombre: { type: "varchar(120)", notNull: true },
    email: { type: "varchar(160)", notNull: true, unique: true },
    telefono: { type: "varchar(40)" },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  // 4) Postulaciones (FKs + estado)
  pgm.createTable("postulaciones", {
    id: "id",
    oferta_id: {
      type: "integer",
      notNull: true,
      references: "ofertas",
      onDelete: "cascade",
      onUpdate: "cascade",
    },
    postulante_id: {
      type: "integer",
      notNull: true,
      references: "postulantes",
      onDelete: "cascade",
      onUpdate: "cascade",
    },
    estado: {
      type: "estado_postulacion",
      notNull: true,
      default: "POSTULANDO",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  // único compuesto (un postulante no puede postular 2 veces a la misma oferta)
  pgm.addConstraint("postulaciones", "uq_postulaciones_oferta_postulante", {
    unique: ["oferta_id", "postulante_id"],
  });

  // 5) Historial de cambios de estado
  pgm.createTable("cambios_estado", {
    id: "id",
    postulacion_id: {
      type: "integer",
      notNull: true,
      references: "postulaciones",
      onDelete: "cascade",
      onUpdate: "cascade",
    },
    estado_nuevo: { type: "estado_postulacion", notNull: true },
    comentario: { type: "text" },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  // 6) Trigger updated_at en ofertas
  pgm.createFunction(
    "set_updated_at",
    [],
    { returns: "trigger", language: "plpgsql" },
    `
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    `
  );
  pgm.createTrigger("ofertas", "trg_ofertas_set_updated_at", {
    when: "BEFORE",
    operation: "UPDATE",
    level: "ROW",
    function: "set_updated_at",
  });

  // 7) Índices útiles
  pgm.createIndex("ofertas", "created_at");
  pgm.createIndex("ofertas", "is_active");
  pgm.createIndex("postulaciones", ["oferta_id", "postulante_id"]);
  pgm.createIndex("postulaciones", "estado");
  pgm.createIndex("cambios_estado", "postulacion_id");

  // (opcional) chequeo simple de email
  pgm.addConstraint("postulantes", "chk_postulantes_email_format", {
    check: `email ~* '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'`,
  });
};

export const down = (pgm) => {
  pgm.dropConstraint("postulantes", "chk_postulantes_email_format");
  pgm.dropIndex("cambios_estado", "postulacion_id");
  pgm.dropIndex("postulaciones", "estado");
  pgm.dropIndex("postulaciones", ["oferta_id", "postulante_id"]);
  pgm.dropIndex("ofertas", "is_active");
  pgm.dropIndex("ofertas", "created_at");
  pgm.dropTrigger("ofertas", "trg_ofertas_set_updated_at");
  pgm.dropFunction("set_updated_at");
  pgm.dropTable("cambios_estado");
  pgm.dropConstraint("postulaciones", "uq_postulaciones_oferta_postulante");
  pgm.dropTable("postulaciones");
  pgm.dropTable("postulantes");
  pgm.dropTable("ofertas");
  pgm.dropType("estado_postulacion");
};
