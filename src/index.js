require("dotenv").config();
const app = require("./app");
const prisma = require("./utils/prisma");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("DB connection failed:", error);
    process.exit(1);
  }
}

startServer();