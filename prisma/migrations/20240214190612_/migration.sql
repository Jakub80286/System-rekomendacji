/*
  Warnings:

  - You are about to drop the column `popularity` on the `Song` table. All the data in the column will be lost.
  - You are about to drop the `Artist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SongArtist` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SongArtist" DROP CONSTRAINT "SongArtist_artistId_fkey";

-- DropForeignKey
ALTER TABLE "SongArtist" DROP CONSTRAINT "SongArtist_songId_fkey";

-- AlterTable
ALTER TABLE "Song" DROP COLUMN "popularity";

-- DropTable
DROP TABLE "Artist";

-- DropTable
DROP TABLE "SongArtist";
