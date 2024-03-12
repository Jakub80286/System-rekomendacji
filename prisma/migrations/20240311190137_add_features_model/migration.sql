-- CreateTable
CREATE TABLE "Feature" (
    "feature_id" SERIAL NOT NULL,
    "photo_id" INTEGER NOT NULL,
    "label" TEXT,
    "red" INTEGER,
    "green" INTEGER,
    "blue" INTEGER,
    "score" DOUBLE PRECISION,
    "pixelFraction" DOUBLE PRECISION,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("feature_id")
);

-- CreateIndex
CREATE INDEX "Feature_photo_id_idx" ON "Feature"("photo_id");

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "Photo"("photo_id") ON DELETE RESTRICT ON UPDATE CASCADE;
