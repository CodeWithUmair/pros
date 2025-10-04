import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Delete data in correct order
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleared old data");

  // Hash passwords
  const hashed = await bcrypt.hash("password123", 10);

  // Create users
  const umair = await prisma.user.create({
    data: {
      name: "Umair Amir",
      email: "umair@example.com",
      password: hashed,
      bio: "Software Engineer passionate about building meaningful Muslim networks.",
      city: "Karachi",
      madhab: "Hanafi",
      halalCareerPreference: true,
      avatar: "https://i.pravatar.cc/150?img=3",
      isVerified: true, // <-- allow login
    },
  });

  const ali = await prisma.user.create({
    data: {
      name: "Ali Khan",
      email: "ali@example.com",
      password: hashed,
      bio: "Backend dev interested in Halal startups and open source.",
      city: "Lahore",
      madhab: "Shafi’i",
      halalCareerPreference: true,
      avatar: "https://i.pravatar.cc/150?img=7",
      isVerified: true,
    },
  });

  const js = await prisma.skill.create({ data: { name: "JavaScript" } });
  const ts = await prisma.skill.create({ data: { name: "TypeScript" } });
  const nextjs = await prisma.skill.create({ data: { name: "Next.js" } });

  await prisma.userSkill.createMany({
    data: [
      { userId: umair.id, skillId: js.id },
      { userId: umair.id, skillId: ts.id },
      { userId: ali.id, skillId: nextjs.id },
    ],
  });

  await prisma.post.createMany({
    data: [
      {
        content: "Excited to be working on a Muslim professionals network app!",
        authorId: umair.id,
      },
      {
        content: "Just deployed my Nest.js + Next.js stack — Alhamdulillah!",
        authorId: ali.id,
      },
      {
        content: "Anyone interested in collaborating on a Halal job platform?",
        authorId: umair.id,
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
