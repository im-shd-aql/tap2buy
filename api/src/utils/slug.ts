import { prisma } from "../config/database";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "store";

  let slug = base;
  for (let i = 0; i < 5; i++) {
    const existing = await prisma.store.findUnique({ where: { slug } });
    if (!existing) return slug;
    const suffix = Math.random().toString(36).substring(2, 6);
    slug = `${base}-${suffix}`;
  }

  return slug;
}
