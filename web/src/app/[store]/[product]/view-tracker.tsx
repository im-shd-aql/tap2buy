"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";

interface Props {
  storeId: string;
  productId: string;
}

export default function ViewTracker({ storeId, productId }: Props) {
  useEffect(() => {
    // Track view after a short delay to ensure it's a real view
    const timer = setTimeout(() => {
      api
        .post(`/api/stores/${storeId}/products/${productId}/view`, {})
        .catch(() => {
          // Silently fail - view tracking is not critical
        });
    }, 2000);

    return () => clearTimeout(timer);
  }, [storeId, productId]);

  return null; // This component doesn't render anything
}
