/*
  Warnings:

  - You are about to drop the column `flightDetails` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `routeId` on the `Reservation` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "biletDukkaniOrderId" TEXT,
    "biletDukkaniRouteId" TEXT,
    "pnr" TEXT,
    "validUntil" DATETIME,
    "passengers" TEXT,
    "flightNumber" TEXT,
    "origin" TEXT,
    "destination" TEXT,
    "departureTime" DATETIME,
    "arrivalTime" DATETIME,
    "airline" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Reservation" ("amount", "createdAt", "currency", "id", "pnr", "status", "type", "updatedAt", "userId") SELECT "amount", "createdAt", "currency", "id", "pnr", "status", "type", "updatedAt", "userId" FROM "Reservation";
DROP TABLE "Reservation";
ALTER TABLE "new_Reservation" RENAME TO "Reservation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
