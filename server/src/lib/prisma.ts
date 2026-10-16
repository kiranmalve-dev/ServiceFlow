import { PrismaClient } from "@prisma/client";

// Singleton — one PrismaClient for the whole process.
// No need to pass it as an argument through routes/controllers/services.
const prisma = new PrismaClient({
  log: process.env["NODE_ENV"] === "development" ? ["query", "warn", "error"] : ["error"],
});

export default prisma;
