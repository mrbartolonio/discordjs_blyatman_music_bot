-- CreateTable
CREATE TABLE "Data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guild" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "message" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Data_guild_key" ON "Data"("guild");
