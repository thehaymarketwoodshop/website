'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import {
  ShopifyCart,
  cartCreate,
  cartGet,
  cartLinesAdd,
  cartLinesUpdate,
  cartLinesRemove,
} from '@/lib/shopifyCart';

const CART_ID_KEY = 'haymarket_cart_id';

// ─────────────────────────────────────────────
// CONTEXT TYPE
// ─────────────────────────────────────────────

interface CartContextType {
  cart: ShopifyCart | null;
  isLoading: boolean;
  isAdding: boolean;
  isOpen: boolean;
  itemCount: number;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

// ─────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const cartIdRef = useRef<string | null>(null);

  // ── Initialise cart from localStorage on mount ──
  useEffect(() => {
    const stored = localStorage.getItem(CART_ID_KEY);
    if (!stored) return;

    cartIdRef.current = stored;
    setIsLoading(true);

    cartGet(stored)
      .then((c) => {
        if (c) {
          setCart(c);
        } else {
          // Cart expired — clear it
          localStorage.removeItem(CART_ID_KEY);
          cartIdRef.current = null;
        }
      })
      .catch(() => {
        localStorage.removeItem(CART_ID_KEY);
        cartIdRef.current = null;
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ── Helpers ──
  const persistCart = useCallback((c: ShopifyCart) => {
    setCart(c);
    cartIdRef.current = c.id;
    localStorage.setItem(CART_ID_KEY, c.id);
  }, []);

  // ── Actions ──
  const addToCart = useCallback(
    async (variantId: string, quantity = 1) => {
      setIsAdding(true);
      try {
        let updated: ShopifyCart;
        if (cartIdRef.current) {
          updated = await cartLinesAdd(cartIdRef.current, variantId, quantity);
        } else {
          updated = await cartCreate(variantId, quantity);
        }
        persistCart(updated);
        setIsOpen(true); // open drawer after adding
      } finally {
        setIsAdding(false);
      }
    },
    [persistCart],
  );

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cartIdRef.current) return;
      setIsLoading(true);
      try {
        const updated = await cartLinesUpdate(cartIdRef.current, lineId, quantity);
        persistCart(updated);
      } finally {
        setIsLoading(false);
      }
    },
    [persistCart],
  );

  const removeFromCart = useCallback(
    async (lineId: string) => {
      if (!cartIdRef.current) return;
      setIsLoading(true);
      try {
        const updated = await cartLinesRemove(cartIdRef.current, lineId);
        persistCart(updated);
      } finally {
        setIsLoading(false);
      }
    },
    [persistCart],
  );

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const itemCount = cart?.totalQuantity ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isAdding,
        isOpen,
        itemCount,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
