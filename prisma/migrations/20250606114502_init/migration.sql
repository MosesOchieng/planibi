/*
  Warnings:

  - You are about to drop the column `description` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Trip` table. All the data in the column will be lost.
  - Added the required column `budget` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destination` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Accommodation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "location" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "image" TEXT NOT NULL,
    "amenities" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Flight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "airline" TEXT NOT NULL,
    "flightNumber" TEXT NOT NULL,
    "departure" TEXT NOT NULL,
    "arrival" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "duration" TEXT NOT NULL,
    "stops" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "AddOn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AddOnToTrip" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AddOnToTrip_A_fkey" FOREIGN KEY ("A") REFERENCES "AddOn" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AddOnToTrip_B_fkey" FOREIGN KEY ("B") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "budget" REAL NOT NULL,
    "accommodationId" TEXT,
    "flightId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Trip_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "Accommodation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Trip_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Trip" ("createdAt", "endDate", "id", "startDate", "updatedAt", "userId") SELECT "createdAt", "endDate", "id", "startDate", "updatedAt", "userId" FROM "Trip";
DROP TABLE "Trip";
ALTER TABLE "new_Trip" RENAME TO "Trip";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_AddOnToTrip_AB_unique" ON "_AddOnToTrip"("A", "B");

-- CreateIndex
CREATE INDEX "_AddOnToTrip_B_index" ON "_AddOnToTrip"("B");
