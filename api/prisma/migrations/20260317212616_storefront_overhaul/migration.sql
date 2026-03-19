-- AlterTable
ALTER TABLE "products" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "about_text" TEXT,
ADD COLUMN     "announcement" TEXT,
ADD COLUMN     "banner_url" TEXT,
ADD COLUMN     "delivery_info" TEXT,
ADD COLUMN     "font_style" TEXT DEFAULT 'modern',
ADD COLUMN     "return_policy" TEXT,
ADD COLUMN     "social_links" JSONB,
ADD COLUMN     "whatsapp_number" TEXT;
