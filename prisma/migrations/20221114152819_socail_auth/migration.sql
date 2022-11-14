-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('email', 'google', 'facebook', 'apple');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "authType" "AuthType" NOT NULL DEFAULT 'email',
ADD COLUMN     "isSocialSignUp" BOOLEAN DEFAULT false,
ALTER COLUMN "hash" DROP NOT NULL;
