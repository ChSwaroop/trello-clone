-- CreateEnum
CREATE TYPE "CardRecurring" AS ENUM ('NEVER', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "DueDateReminder" AS ENUM ('NONE', 'AT_DUE_DATE', 'FIVE_MINUTES', 'FIFTEEN_MINUTES', 'ONE_HOUR', 'TWO_HOURS', 'ONE_DAY', 'TWO_DAYS');

-- DropIndex
DROP INDEX "cards_title_trgm_idx";

-- AlterTable
ALTER TABLE "cards" ADD COLUMN     "dueDateReminder" "DueDateReminder" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "dueTime" TEXT,
ADD COLUMN     "recurring" "CardRecurring" NOT NULL DEFAULT 'NEVER';

-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "labels" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "workspaces" ALTER COLUMN "updatedAt" DROP DEFAULT;
