/*
  Warnings:

  - Added the required column `score` to the `Label` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Label" ADD COLUMN     "score" DOUBLE PRECISION NOT NULL;
