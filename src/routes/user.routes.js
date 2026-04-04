const express = require("express");
const router = express.Router();

const userController = require("../controllers/user/user.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");
const { createUserSchema, updateUserSchema } = require("../schemas/user.schema");

router.post(
  "/users",
  authenticate,
  authorizeRoles("ADMIN"),
  validate(createUserSchema),
  userController.createUser
);

router.get(
  "/users",
  authenticate,
  authorizeRoles("ADMIN"),
  userController.getUsers
);

router.patch(
  "/users/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  validate(updateUserSchema),
  userController.updateUser
);

router.delete(
  "/users/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  userController.deleteUser
);

module.exports = router;
