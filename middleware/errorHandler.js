function errorHandler(err, req, res, next) {
  console.error(err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
}

module.exports = { errorHandler };


