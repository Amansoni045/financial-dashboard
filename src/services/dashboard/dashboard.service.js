const prisma = require("../../utils/prisma");

exports.getSummary = async () => {
  const [income, expense, totalRecords] = await Promise.all([
    prisma.financialRecord.aggregate({
      _sum: { amount: true },
      where: { type: "INCOME", deletedAt: null },
    }),
    prisma.financialRecord.aggregate({
      _sum: { amount: true },
      where: { type: "EXPENSE", deletedAt: null },
    }),
    prisma.financialRecord.count({ where: { deletedAt: null } }),
  ]);

  const totalIncome = income._sum.amount || 0;
  const totalExpense = expense._sum.amount || 0;

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    totalRecords,
  };
};

exports.getCategoryBreakdown = async () => {
  const categories = await prisma.financialRecord.groupBy({
    by: ["category", "type"],
    _sum: { amount: true },
    where: { deletedAt: null },
  });

  return categories.map((cat) => ({
    category: cat.category,
    type: cat.type,
    total: cat._sum.amount || 0,
  }));
};

exports.getRecentTransactions = async () => {
  return await prisma.financialRecord.findMany({
    where: { deletedAt: null },
    take: 10,
    orderBy: { date: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
};

exports.getMonthlyTrends = async () => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const records = await prisma.financialRecord.findMany({
    where: {
      deletedAt: null,
      date: { gte: twelveMonthsAgo },
    },
    select: { amount: true, type: true, date: true },
  });

  const monthMap = {};

  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap[key] = { month: key, income: 0, expense: 0, net: 0 };
  }

  for (const record of records) {
    const d = new Date(record.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthMap[key]) {
      if (record.type === "INCOME") {
        monthMap[key].income += record.amount;
      } else {
        monthMap[key].expense += record.amount;
      }
      monthMap[key].net = monthMap[key].income - monthMap[key].expense;
    }
  }

  return Object.values(monthMap);
};