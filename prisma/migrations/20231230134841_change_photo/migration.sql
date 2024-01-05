/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Photo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Photo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Photo_name_key" ON "Photo"("name");
