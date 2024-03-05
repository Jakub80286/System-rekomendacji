/*
  Warnings:

  - You are about to drop the `UserLike` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserLike" DROP CONSTRAINT "UserLike_photo_id_fkey";

-- DropForeignKey
ALTER TABLE "UserLike" DROP CONSTRAINT "UserLike_user_id_fkey";

-- DropTable
DROP TABLE "UserLike";

-- CreateTable
CREATE TABLE "Like" (
    "like_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "song_id" TEXT,
    "photo_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("like_id")
);

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "Song"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "Photo"("photo_id") ON DELETE SET NULL ON UPDATE CASCADE;
