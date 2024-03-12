/*
  Warnings:

  - You are about to drop the column `label` on the `Feature` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Feature" DROP COLUMN "label",
ADD COLUMN     "labelId" INTEGER;

-- CreateTable
CREATE TABLE "Label" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Label_name_key" ON "Label"("name");

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE SET NULL ON UPDATE CASCADE;
