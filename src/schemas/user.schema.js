const { z } = require("zod");

exports.createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["VIEWER", "ANALYST", "ADMIN"])
  })
});

exports.updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    role: z.enum(["VIEWER", "ANALYST", "ADMIN"]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional()
  })
});
