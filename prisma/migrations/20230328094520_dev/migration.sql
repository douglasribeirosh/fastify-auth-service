-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "nickname" TEXT,
    "namePrefix" TEXT,
    "name" TEXT,
    "passwordHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "domainId" TEXT NOT NULL,
    CONSTRAINT "User_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "domainId", "email", "id", "name", "namePrefix", "nickname", "passwordHash", "updatedAt") SELECT "createdAt", "domainId", "email", "id", "name", "namePrefix", "nickname", "passwordHash", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_domainId_key" ON "User"("email", "domainId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
