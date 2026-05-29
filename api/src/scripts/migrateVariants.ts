/**
 * Migration script: Convert old-style variants (JSON) to new ProductVariant records
 *
 * Run with: npx tsx src/scripts/migrateVariants.ts
 */

import { prisma } from "../config/database";
import { toDecimal } from "../utils/fees";

function generateSKU(productId: string, attributes: Record<string, string>): string {
  const attrString = Object.entries(attributes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k.substring(0, 2)}${v.substring(0, 2)}`)
    .join("-")
    .toUpperCase();
  return `${productId.substring(0, 8)}-${attrString}`;
}

function generateCombinations(
  options: { name: string; values: string[] }[]
): Record<string, string>[] {
  if (options.length === 0) return [];
  if (options.length === 1) {
    return options[0].values.map((value) => ({ [options[0].name]: value }));
  }

  const [first, ...rest] = options;
  const restCombinations = generateCombinations(rest);

  const combinations: Record<string, string>[] = [];
  for (const value of first.values) {
    for (const combo of restCombinations) {
      combinations.push({ [first.name]: value, ...combo });
    }
  }

  return combinations;
}

function createVariantName(attributes: Record<string, string>): string {
  return Object.values(attributes).join(" / ");
}

async function migrateVariants() {
  console.log("🔄 Starting variant migration...\n");

  // Find all products with old-style variants
  const productsWithOldVariants = await prisma.product.findMany({
    where: {
      variants: { not: null },
      hasVariants: false,
    },
  });

  console.log(`Found ${productsWithOldVariants.length} products with old-style variants\n`);

  if (productsWithOldVariants.length === 0) {
    console.log("✅ No products to migrate");
    return;
  }

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const product of productsWithOldVariants) {
    try {
      console.log(`\n📦 Processing: ${product.name} (${product.id})`);

      const variantsData = product.variants as any;

      // Validate variant structure
      if (!variantsData?.options || !Array.isArray(variantsData.options)) {
        console.log(`  ⚠️  Skipped - Invalid variant structure`);
        skippedCount++;
        continue;
      }

      const options = variantsData.options.filter(
        (opt: any) => opt.name && Array.isArray(opt.values) && opt.values.length > 0
      );

      if (options.length === 0) {
        console.log(`  ⚠️  Skipped - No valid options found`);
        skippedCount++;
        continue;
      }

      console.log(`  Options: ${options.map((o: any) => `${o.name} (${o.values.length})`).join(", ")}`);

      // Generate all combinations
      const combinations = generateCombinations(options);
      console.log(`  Generated ${combinations.length} variants`);

      // Create ProductVariant records
      const createdVariants = [];
      for (let i = 0; i < combinations.length; i++) {
        const attributes = combinations[i];
        const sku = generateSKU(product.id, attributes);
        const name = createVariantName(attributes);

        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku,
            name,
            attributes,
            price: product.price, // Inherit product price
            comparePrice: product.comparePrice,
            stock: product.stock, // Inherit product stock (will be null for unlimited)
            images: [], // No variant-specific images initially
            isActive: true,
            sortOrder: i,
          },
        });

        createdVariants.push(variant);
      }

      // Update product to mark it as having variants
      await prisma.product.update({
        where: { id: product.id },
        data: { hasVariants: true },
      });

      console.log(`  ✅ Created ${createdVariants.length} variant records`);
      migratedCount++;
    } catch (error) {
      console.error(`  ❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Migration Summary:");
  console.log(`  ✅ Successfully migrated: ${migratedCount} products`);
  console.log(`  ⚠️  Skipped: ${skippedCount} products`);
  console.log(`  ❌ Errors: ${errorCount} products`);
  console.log("=".repeat(60));

  if (migratedCount > 0) {
    console.log("\n💡 Next steps:");
    console.log("  1. Review the migrated products in the dashboard");
    console.log("  2. Set individual prices/stock for variants if needed");
    console.log("  3. Upload variant-specific images");
    console.log("  4. Test variant selection on the storefront");
  }
}

// Run migration
migrateVariants()
  .then(() => {
    console.log("\n✨ Migration completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration failed:", error);
    process.exit(1);
  });
