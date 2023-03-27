/*
  Warnings:

  - You are about to drop the `Devuser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Devuser_username_key";

-- DropIndex
DROP INDEX "Devuser_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Devuser";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Dev" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Domain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Domain_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Dev" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Domain" ("active", "createdAt", "id", "name", "ownerId", "updatedAt") SELECT "active", "createdAt", "id", "name", "ownerId", "updatedAt" FROM "Domain";
DROP TABLE "Domain";
ALTER TABLE "new_Domain" RENAME TO "Domain";
CREATE UNIQUE INDEX "Domain_name_key" ON "Domain"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Dev_email_key" ON "Dev"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Dev_username_key" ON "Dev"("username");
