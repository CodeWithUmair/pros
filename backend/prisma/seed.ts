import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Resetting and seeding users...");

    await prisma.user.deleteMany(); // clear existing users

    const password = await bcrypt.hash("123", 10);

    const users = [
        { name: "Umair Amir", email: "umair1@example.com" },
        { name: "Ali Raza", email: "ali@example.com" },
        { name: "Ahmed Khan", email: "ahmed@example.com" },
        { name: "Sara Malik", email: "sara@example.com" },
        { name: "Hassan Tariq", email: "hassan@example.com" },
        { name: "Zara Fatima", email: "zara@example.com" },
        { name: "Bilal Ahmad", email: "bilal@example.com" },
        { name: "Ayesha Noor", email: "ayesha@example.com" },
        { name: "Hamza Iqbal", email: "hamza@example.com" },
        { name: "Fatima Rehman", email: "fatima@example.com" },
    ];

    for (const user of users) {
        await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password,
                isVerified: true,
                city: "Karachi",
                bio: `Hi, I'm ${user.name} — testing the platform.`,
            },
        });
    }

    console.log("✅ Seeding complete!");
}

main()
    .catch((err) => {
        console.error("❌ Seed error:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
