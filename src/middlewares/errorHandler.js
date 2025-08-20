export function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.name || "InternalServerError",
    message: err.message || "An error occurred",
  });
}
