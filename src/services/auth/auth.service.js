const prisma = require("../../utils/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "finance-dashboard-dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

exports.login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  if (user.status === "INACTIVE") {
    const err = new Error("Account is inactive");
    err.status = 403;
    throw err;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};
