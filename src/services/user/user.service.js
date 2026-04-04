const prisma = require("../../utils/prisma");
const bcrypt = require("bcryptjs");

exports.createUser = async (data) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    const err = new Error("A user with this email already exists");
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: { ...data, password: hashedPassword },
  });

  const { password, ...safeUser } = user;
  return safeUser;
};

exports.getUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

exports.updateUser = async (id, data) => {
  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

exports.deleteUser = async (id) => {
  return await prisma.user.delete({ where: { id } });
};