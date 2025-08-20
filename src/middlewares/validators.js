const isType = (val, type) => {
  if (type === "number") return typeof val === "number" && !Number.isNaN(val);
  if (type === "int") return Number.isInteger(val);
  if (type === "string") return typeof val === "string";
  if (type === "boolean") return typeof val === "boolean";
  return true;
};

const coerce = (val, type) => {
  if (val === undefined || val === null) return val;
  if (type === "number" || type === "int") {
    const n = Number(val);
    return Number.isNaN(n) ? val : n;
  }
  if (type === "boolean") {
    if (val === "true") return true;
    if (val === "false") return false;
  }
  return val;
};

/**
 * Uso:
 * validate({
 *   params: { id: { required:true, type:'int', min:1 } },
 *   query:  { page:{type:'int', min:1}, search:{type:'string', max:150, trim:true} },
 *   body:   { titulo:{required:true, type:'string', min:3, max:150} }
 * })
 */
export function validate(schema = {}) {
  return (req, res, next) => {
    const errors = [];
    const out = { body: {}, params: {}, query: {} };

    ["body", "params", "query"].forEach((part) => {
      const rules = schema[part] || {};
      const src = req[part] || {};

      for (const [key, rule] of Object.entries(rules)) {
        let val = src[key];

        // required
        if (
          rule.required &&
          (val === undefined || val === null || val === "")
        ) {
          errors.push({ field: `${part}.${key}`, message: "required" });
          continue;
        }
        if (val === undefined || val === null || val === "") continue; // no requerido y vacío

        // coerción básica
        if (rule.type) val = coerce(val, rule.type);

        // type
        if (rule.type && !isType(val, rule.type)) {
          errors.push({
            field: `${part}.${key}`,
            message: `type ${rule.type}`,
          });
          continue;
        }

        // min / max (string length o número)
        if (rule.min !== undefined) {
          if (typeof val === "string" && val.length < rule.min)
            errors.push({
              field: `${part}.${key}`,
              message: `min length ${rule.min}`,
            });
          if (typeof val === "number" && val < rule.min)
            errors.push({
              field: `${part}.${key}`,
              message: `min ${rule.min}`,
            });
        }
        if (rule.max !== undefined) {
          if (typeof val === "string" && val.length > rule.max)
            errors.push({
              field: `${part}.${key}`,
              message: `max length ${rule.max}`,
            });
          if (typeof val === "number" && val > rule.max)
            errors.push({
              field: `${part}.${key}`,
              message: `max ${rule.max}`,
            });
        }

        // enum
        if (rule.enum && !rule.enum.includes(val)) {
          errors.push({
            field: `${part}.${key}`,
            message: `must be one of ${rule.enum.join(", ")}`,
          });
        }

        // regex
        if (rule.regex && typeof val === "string" && !rule.regex.test(val)) {
          errors.push({ field: `${part}.${key}`, message: "invalid format" });
        }

        // trim
        if (rule.trim && typeof val === "string") val = val.trim();

        out[part][key] = val;
      }
    });

    if (errors.length) {
      return res.status(422).json({
        error: "ValidationError",
        message: "Invalid input",
        details: errors,
      });
    }

    req.validated = out;
    next();
  };
}
