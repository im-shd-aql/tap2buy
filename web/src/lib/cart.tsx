"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface CartItem {
  productId: string;
  variantId?: string; // New: ProductVariant ID
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: Record<string, string>; // Legacy: variant attributes
}

interface CartContextType {
  items: CartItem[];
  storeId: string | null;
  addItem: (storeId: string, item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string, variant?: Record<string, string>) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string, variant?: Record<string, string>) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

function getStoredCart(): { storeId: string | null; items: CartItem[] } {
  if (typeof window === "undefined") return { storeId: null, items: [] };
  try {
    const data = localStorage.getItem("tap2buy_cart");
    return data ? JSON.parse(data) : { storeId: null, items: [] };
  } catch {
    return { storeId: null, items: [] };
  }
}

// Helper to create a consistent variant key for comparison
function getVariantKey(variant?: Record<string, string>): string {
  if (!variant || Object.keys(variant).length === 0) return "";
  return JSON.stringify(Object.entries(variant).sort());
}

// Helper to check if two items match (same product + variant)
function itemsMatch(
  productId1: string,
  variantId1: string | undefined,
  variant1: Record<string, string> | undefined,
  productId2: string,
  variantId2: string | undefined,
  variant2: Record<string, string> | undefined
): boolean {
  // If both have variantIds, compare those (new system)
  if (variantId1 && variantId2) {
    return variantId1 === variantId2;
  }
  // Otherwise fall back to product + variant attributes (legacy system)
  return productId1 === productId2 && getVariantKey(variant1) === getVariantKey(variant2);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredCart();
    setItems(stored.items);
    setStoreId(stored.storeId);
  }, []);

  const save = useCallback((newStoreId: string | null, newItems: CartItem[]) => {
    setItems(newItems);
    setStoreId(newStoreId);
    localStorage.setItem("tap2buy_cart", JSON.stringify({ storeId: newStoreId, items: newItems }));
  }, []);

  const addItem = useCallback((newStoreId: string, item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    // Get current state
    const currentCart = getStoredCart();
    let currentItems = currentCart.items;
    let currentStoreId = currentCart.storeId;

    // If different store, clear cart
    if (currentStoreId && currentStoreId !== newStoreId) {
      const newCart = [{ ...item, quantity }];
      save(newStoreId, newCart);
      return;
    }

    currentStoreId = newStoreId;

    // Find existing item with same product + variant
    const existing = currentItems.find((i) =>
      itemsMatch(i.productId, i.variantId, i.variant, item.productId, item.variantId, item.variant)
    );

    let newItems: CartItem[];
    if (existing) {
      // Update quantity of existing item
      newItems = currentItems.map((i) =>
        itemsMatch(i.productId, i.variantId, i.variant, item.productId, item.variantId, item.variant)
          ? { ...i, quantity: i.quantity + quantity }
          : i
      );
    } else {
      // Add new item
      newItems = [...currentItems, { ...item, quantity }];
    }

    save(currentStoreId, newItems);
  }, [save]);

  const removeItem = useCallback((productId: string, variantId?: string, variant?: Record<string, string>) => {
    const currentCart = getStoredCart();
    const filtered = currentCart.items.filter(
      (i) => !itemsMatch(i.productId, i.variantId, i.variant, productId, variantId, variant)
    );
    save(filtered.length > 0 ? currentCart.storeId : null, filtered);
  }, [save]);

  const updateQuantity = useCallback((productId: string, quantity: number, variantId?: string, variant?: Record<string, string>) => {
    if (quantity <= 0) {
      removeItem(productId, variantId, variant);
      return;
    }

    const currentCart = getStoredCart();
    const updated = currentCart.items.map((i) =>
      itemsMatch(i.productId, i.variantId, i.variant, productId, variantId, variant)
        ? { ...i, quantity }
        : i
    );
    save(currentCart.storeId, updated);
  }, [save, removeItem]);

  const clearCart = useCallback(() => {
    save(null, []);
  }, [save]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, storeId, addItem, removeItem, updateQuantity, clearCart, subtotal, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
