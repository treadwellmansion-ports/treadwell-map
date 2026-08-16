"use client";

import { useState } from "react";

// Plain in-memory state, not persisted -- matches how selectedEntity/view
// are handled elsewhere in the guest map (ephemeral per browsing session,
// and cleared by the kiosk's existing idle-reset alongside everything else).
export function useCart() {
  const [cartIds, setCartIds] = useState<Set<string>>(new Set());

  function addToCart(id: string) {
    setCartIds((prev) => {
      if (prev.has(id)) return prev;
      return new Set(prev).add(id);
    });
  }

  function removeFromCart(id: string) {
    setCartIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function toggleCart(id: string) {
    setCartIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function isInCart(id: string) {
    return cartIds.has(id);
  }

  function clearCart() {
    setCartIds(new Set());
  }

  return { cartIds, addToCart, removeFromCart, toggleCart, isInCart, clearCart, count: cartIds.size };
}
