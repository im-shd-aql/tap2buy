-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "category_last_changed_at" TIMESTAMP(3),
ADD COLUMN     "name_change_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "name_change_count_year" INTEGER NOT NULL DEFAULT 2026,
ADD COLUMN     "name_last_changed_at" TIMESTAMP(3),
ADD COLUMN     "slug_last_changed_at" TIMESTAMP(3);
