"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: any;
}

interface CartContextType {
  items: CartItem[];
  storeId: string | null;
  addItem: (storeId: string, item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
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
    let currentItems = items;
    let currentStoreId = storeId;

    // If different store, clear cart
    if (currentStoreId && currentStoreId !== newStoreId) {
      currentItems = [];
    }
    currentStoreId = newStoreId;

    const existing = currentItems.find((i) => i.productId === item.productId);
    if (existing) {
      const updated = currentItems.map((i) =>
        i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i
      );
      save(currentStoreId, updated);
    } else {
      save(currentStoreId, [...currentItems, { ...item, quantity }]);
    }
  }, [items, storeId, save]);

  const removeItem = useCallback((productId: string) => {
    const filtered = items.filter((i) => i.productId !== productId);
    save(filtered.length > 0 ? storeId : null, filtered);
  }, [items, storeId, save]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    const updated = items.map((i) =>
      i.productId === productId ? { ...i, quantity } : i
    );
    save(storeId, updated);
  }, [items, storeId, save, removeItem]);

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
