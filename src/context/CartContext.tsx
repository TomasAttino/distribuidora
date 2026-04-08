"use client"
import React, { createContext, useContext, useState } from 'react';

type Product = { id: number; name: string; price: number; imageUrl?: string };
type CartItem = Product & { quantity: number };

type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, q: number) => void;
  clearCart: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setItems(current => {
      const existing = current.find(item => item.id === product.id);
      if (existing) {
        return current.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setItems(current => current.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, q: number) => {
    if (q < 1) {
      removeFromCart(productId);
      return;
    }
    setItems(current => current.map(item => item.id === productId ? { ...item, quantity: q } : item));
  };

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
