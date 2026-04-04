const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboard/dashboard.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

router.get(
  "/dashboard/summary",
  authenticate,
  authorizeRoles("ADMIN", "ANALYST", "VIEWER"),
  dashboardController.getSummary
);

router.get(
  "/dashboard/categories",
  authenticate,
  authorizeRoles("ADMIN", "ANALYST", "VIEWER"),
  dashboardController.getCategoryBreakdown
);

router.get(
  "/dashboard/recent",
  authenticate,
  authorizeRoles("ADMIN", "ANALYST", "VIEWER"),
  dashboardController.getRecentTransactions
);

router.get(
  "/dashboard/trends",
  authenticate,
  authorizeRoles("ADMIN", "ANALYST", "VIEWER"),
  dashboardController.getTrends
);

module.exports = router;