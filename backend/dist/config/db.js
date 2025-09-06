"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
prisma.$connect()
    .then(() => console.log("✅ DB connected successfully"))
    .catch((err) => {
    console.error("❌ Error connecting to DB:", err);
    process.exit(1);
});
exports.default = prisma;
