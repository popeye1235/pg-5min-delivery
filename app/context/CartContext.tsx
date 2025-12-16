"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface CartItem extends Product {
  qty: number;
}

interface CartContextType {
  cart: CartItem[];
  add: (item: Product) => void;
  decrease: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Define a constant key for localStorage
const LOCAL_STORAGE_KEY = "pg_delivery_cart"; 

export const CartProvider = ({ children }: { children: ReactNode }) => {
  
  // 1. Initialize state: Load cart data from localStorage on component mount
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    }
    // Default to empty array if not in a browser environment (SSR/SSG)
    return [];
  });

  // 2. Save cart to localStorage whenever the cart state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart]);


  // ➤ ADD ITEM OR INCREASE QTY
  const add = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);

      if (existing) {
        // Prevent exceeding stock
        if (existing.qty >= product.stock) {
          // alert("No more stock available");
          return prev;
        }

        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        );
      }

      return [...prev, { ...product, qty: 1 }];
    });
  };

  // ➤ DECREASE QTY BUT REMOVE IF ZERO
  const decrease = (id: string) => {
    setCart((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, qty: Math.max(0, p.qty - 1) } : p
        )
        .filter((p) => p.qty > 0)
    );
  };

  // ➤ REMOVE ITEM COMPLETELY
  const remove = (id: string) =>
    setCart((prev) => prev.filter((p) => p.id !== id));

  // ➤ EMPTY CART - Also clear localStorage
  const clear = () => {
    setCart([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  // ➤ CALCULATE TOTAL
  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        add,
        decrease,
        remove,
        clear,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};