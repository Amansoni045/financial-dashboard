const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth/auth.controller");

router.post("/auth/login", authController.login);

module.exports = router;
