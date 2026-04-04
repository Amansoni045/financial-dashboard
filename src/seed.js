require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

const pool = new (require("pg").Pool)({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const USERS = [
  {
    id: "seed-admin-001",
    name: "Alice Admin",
    email: "admin@finance.dev",
    password: "Admin@1234",
    role: "ADMIN",
    status: "ACTIVE",
  },
  {
    id: "seed-analyst-001",
    name: "Bob Analyst",
    email: "analyst@finance.dev",
    password: "Analyst@1234",
    role: "ANALYST",
    status: "ACTIVE",
  },
  {
    id: "seed-viewer-001",
    name: "Carol Viewer",
    email: "viewer@finance.dev",
    password: "Viewer@1234",
    role: "VIEWER",
    status: "ACTIVE",
  },
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const INCOME_RECORDS = [
  { amount: 85000, category: "Salary", notes: "Monthly salary – April" },
  { amount: 85000, category: "Salary", notes: "Monthly salary – March" },
  { amount: 85000, category: "Salary", notes: "Monthly salary – February" },
  { amount: 85000, category: "Salary", notes: "Monthly salary – January" },
  { amount: 12000, category: "Freelance", notes: "Design project payment" },
  { amount: 8500,  category: "Freelance", notes: "API integration consulting" },
  { amount: 3200,  category: "Investments", notes: "Mutual fund dividend" },
  { amount: 1500,  category: "Investments", notes: "Stock dividend payout" },
  { amount: 500,   category: "Other", notes: "Cashback reward" },
  { amount: 2200,  category: "Rental", notes: "Flat rental income" },
];

const EXPENSE_RECORDS = [
  { amount: 18000, category: "Rent",          notes: "Monthly apartment rent" },
  { amount: 18000, category: "Rent",          notes: "Monthly apartment rent – March" },
  { amount: 4500,  category: "Groceries",     notes: "Weekly grocery shopping" },
  { amount: 3200,  category: "Groceries",     notes: "Grocery run" },
  { amount: 1200,  category: "Utilities",     notes: "Electricity and water bill" },
  { amount: 800,   category: "Utilities",     notes: "Internet and phone" },
  { amount: 2400,  category: "Transport",     notes: "Monthly commute and fuel" },
  { amount: 5000,  category: "Entertainment", notes: "Weekend getaway" },
  { amount: 1800,  category: "Healthcare",    notes: "Doctor visit and medicines" },
  { amount: 15000, category: "Software",      notes: "Annual SaaS tool subscriptions" },
  { amount: 3500,  category: "Dining",        notes: "Restaurant and food delivery" },
  { amount: 900,   category: "Subscriptions", notes: "Streaming and cloud services" },
];

async function main() {
  console.log("🌱 Starting seed...\n");

  await prisma.financialRecord.deleteMany({});
  await prisma.user.deleteMany({});

  for (const u of USERS) {
    const hashed = await bcrypt.hash(u.password, 10);
    await prisma.user.create({
      data: { ...u, password: hashed },
    });
    console.log(`✅ Created user: ${u.name} (${u.role}) — ${u.email} / ${u.password}`);
  }

  console.log("");

  const adminId = "seed-admin-001";
  let day = 0;

  for (const rec of INCOME_RECORDS) {
    await prisma.financialRecord.create({
      data: {
        amount: rec.amount,
        type: "INCOME",
        category: rec.category,
        date: daysAgo(day),
        notes: rec.notes,
        userId: adminId,
      },
    });
    day += randomInt(3, 10);
  }

  day = 1;
  for (const rec of EXPENSE_RECORDS) {
    await prisma.financialRecord.create({
      data: {
        amount: rec.amount,
        type: "EXPENSE",
        category: rec.category,
        date: daysAgo(day),
        notes: rec.notes,
        userId: adminId,
      },
    });
    day += randomInt(2, 8);
  }

  console.log(`✅ Seeded ${INCOME_RECORDS.length} income records`);
  console.log(`✅ Seeded ${EXPENSE_RECORDS.length} expense records`);
  console.log("\n🎉 Seed complete!\n");
  console.log("Login credentials:");
  console.log("  Admin    → admin@finance.dev / Admin@1234");
  console.log("  Analyst  → analyst@finance.dev / Analyst@1234");
  console.log("  Viewer   → viewer@finance.dev / Viewer@1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
