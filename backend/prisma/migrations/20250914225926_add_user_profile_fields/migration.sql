/*
  Warnings:

  - A unique constraint covering the columns `[requesterId,receiverId]` on the table `Connection` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,skillId]` on the table `UserSkill` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "halalCareerPreference" BOOLEAN,
ADD COLUMN     "madhab" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Connection_requesterId_receiverId_key" ON "public"."Connection"("requesterId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSkill_userId_skillId_key" ON "public"."UserSkill"("userId", "skillId");
