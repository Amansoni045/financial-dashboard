const prisma = require("../../utils/prisma");

exports.createRecord = async (data, userId) => {
  return await prisma.financialRecord.create({
    data: {
      ...data,
      date: new Date(data.date),
      userId,
    },
  });
};

exports.getRecords = async (filters) => {
  const { type, category, startDate, endDate, page = 1, limit = 20 } = filters;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const where = {
    deletedAt: null,
    ...(type && { type }),
    ...(category && { category }),
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        }
      : {}),
  };

  const [total, records] = await Promise.all([
    prisma.financialRecord.count({ where }),
    prisma.financialRecord.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take: limitNum,
    }),
  ]);

  return {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
    data: records,
  };
};

exports.getRecordById = async (id) => {
  return await prisma.financialRecord.findFirst({
    where: { id, deletedAt: null },
  });
};

exports.updateRecord = async (id, data) => {
  const existing = await prisma.financialRecord.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existing) {
    const err = new Error("Record not found");
    err.code = "P2025";
    throw err;
  }

  return await prisma.financialRecord.update({
    where: { id },
    data: {
      ...data,
      ...(data.date && { date: new Date(data.date) }),
    },
  });
};

exports.deleteRecord = async (id) => {
  const existing = await prisma.financialRecord.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existing) {
    const err = new Error("Record not found");
    err.code = "P2025";
    throw err;
  }

  return await prisma.financialRecord.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};