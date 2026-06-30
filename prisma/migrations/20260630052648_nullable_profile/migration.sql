-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "bio" TEXT,
    "essence" TEXT,
    "interests" TEXT NOT NULL DEFAULT '[]',
    "heightCm" INTEGER,
    "dob" DATETIME,
    "birthHour" INTEGER,
    "birthMinute" INTEGER,
    "birthPlace" TEXT,
    "birthLat" REAL,
    "birthLon" REAL,
    "gender" TEXT,
    "interestedIn" TEXT,
    "connection" TEXT,
    "sunSign" TEXT,
    "moonSign" TEXT,
    "risingSign" TEXT,
    "sunElement" TEXT,
    "baziElement" TEXT,
    "zodiacAnimal" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'aligned',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "birthLocked" BOOLEAN NOT NULL DEFAULT false,
    "isSeed" BOOLEAN NOT NULL DEFAULT false,
    "incognito" BOOLEAN NOT NULL DEFAULT false,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("baziElement", "bio", "birthHour", "birthLat", "birthLocked", "birthLon", "birthMinute", "birthPlace", "connection", "createdAt", "dob", "email", "essence", "gender", "heightCm", "id", "incognito", "interestedIn", "interests", "isSeed", "moonSign", "name", "passwordHash", "plan", "risingSign", "sunElement", "sunSign", "updatedAt", "verified", "zodiacAnimal") SELECT "baziElement", "bio", "birthHour", "birthLat", "birthLocked", "birthLon", "birthMinute", "birthPlace", "connection", "createdAt", "dob", "email", "essence", "gender", "heightCm", "id", "incognito", "interestedIn", "interests", "isSeed", "moonSign", "name", "passwordHash", "plan", "risingSign", "sunElement", "sunSign", "updatedAt", "verified", "zodiacAnimal" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
