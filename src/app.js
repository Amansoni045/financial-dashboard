const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const recordRoutes = require("./routes/record.routes");
const userRoutes = require("./routes/user.routes");
const { errorHandler } = require("./middleware/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", authRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", recordRoutes);
app.use("/api", userRoutes);

app.use(errorHandler);

module.exports = app;