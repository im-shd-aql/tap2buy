"use client";

import { useEffect } from "react";
import { trackRecentlyViewed } from "../recently-viewed";

export default function RecentlyViewedTracker({
  storeSlug,
  product,
}: {
  storeSlug: string;
  product: { id: string; name: string; price: string; image: string };
}) {
  useEffect(() => {
    trackRecentlyViewed(storeSlug, product);
  }, [storeSlug, product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
