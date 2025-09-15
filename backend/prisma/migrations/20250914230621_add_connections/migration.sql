/*
  Warnings:

  - The `status` column on the `Connection` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."ConnectionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."Connection" DROP COLUMN "status",
ADD COLUMN     "status" "public"."ConnectionStatus" NOT NULL DEFAULT 'PENDING';
