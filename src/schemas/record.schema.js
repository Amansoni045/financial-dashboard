const { z } = require("zod");

exports.createRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be a positive number"),
    type: z.enum(["INCOME", "EXPENSE"]),
    category: z.string().min(1, "Category is required"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format. Use ISO 8601 (e.g. 2026-01-15T00:00:00Z)",
    }),
    notes: z.string().optional(),
  }),
});

exports.updateRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive().optional(),
    type: z.enum(["INCOME", "EXPENSE"]).optional(),
    category: z.string().min(1).optional(),
    date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
      })
      .optional(),
    notes: z.string().optional(),
  }),
});
