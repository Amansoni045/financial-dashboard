exports.errorHandler = (err, req, res, next) => {
  if (err.status === 401) {
    return res.status(401).json({ error: err.message || "Unauthorized" });
  }

  if (err.status === 403) {
    return res.status(403).json({ error: err.message || "Forbidden" });
  }

  if (err.code === "P2002") {
    return res.status(409).json({ error: "A record with this value already exists." });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ error: "Resource not found." });
  }

  if (err.code === "P2003") {
    return res.status(400).json({ error: "Referenced resource does not exist." });
  }

  res.status(500).json({
    error: err.message || "Internal server error",
  });
};
