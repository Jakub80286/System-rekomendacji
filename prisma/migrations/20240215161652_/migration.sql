-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "popularity" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "popularity" DOUBLE PRECISION NOT NULL,
    "genres" TEXT[],
    "followers" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SongArtist" (
    "artist_id" TEXT NOT NULL,
    "song_id" TEXT NOT NULL,

    CONSTRAINT "SongArtist_pkey" PRIMARY KEY ("artist_id","song_id")
);

-- AddForeignKey
ALTER TABLE "SongArtist" ADD CONSTRAINT "SongArtist_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SongArtist" ADD CONSTRAINT "SongArtist_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
