-- CreateTable
CREATE TABLE "public"."CategoryDuration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "CategoryDuration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryDuration_userId_category_key" ON "public"."CategoryDuration"("userId", "category");

-- AddForeignKey
ALTER TABLE "public"."CategoryDuration" ADD CONSTRAINT "CategoryDuration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
