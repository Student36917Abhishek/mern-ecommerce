const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const payload = {
    success: false,
    message: err.message || "Internal server error",
  };

  if (err.details !== undefined) {
    payload.details = err.details;
  }

  return res.status(statusCode).json(payload);
};

module.exports = { notFound, errorHandler };
