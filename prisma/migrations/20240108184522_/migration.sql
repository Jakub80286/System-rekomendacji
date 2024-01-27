/*
  Warnings:

  - You are about to drop the `_PhotoToTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PhotoToTag" DROP CONSTRAINT "_PhotoToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_PhotoToTag" DROP CONSTRAINT "_PhotoToTag_B_fkey";

-- DropTable
DROP TABLE "_PhotoToTag";
