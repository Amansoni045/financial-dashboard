const express = require("express");
const router = express.Router();

const recordController = require("../controllers/record/record.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");
const { createRecordSchema, updateRecordSchema } = require("../schemas/record.schema");

router.post(
  "/records",
  authenticate,
  authorizeRoles("ADMIN"),
  validate(createRecordSchema),
  recordController.createRecord
);

router.get(
  "/records",
  authenticate,
  authorizeRoles("ADMIN", "ANALYST", "VIEWER"),
  recordController.getRecords
);

router.get(
  "/records/:id",
  authenticate,
  authorizeRoles("ADMIN", "ANALYST", "VIEWER"),
  recordController.getRecordById
);

router.put(
  "/records/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  validate(updateRecordSchema),
  recordController.updateRecord
);

router.delete(
  "/records/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  recordController.deleteRecord
);

module.exports = router;