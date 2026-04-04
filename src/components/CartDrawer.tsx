'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { getCartLines, formatMoney } from '@/lib/shopifyCart';

export function CartDrawer() {
  const { cart, isLoading, isOpen, closeCart, updateQuantity, removeFromCart } = useCart();
  const lines = cart ? getCartLines(cart) : [];

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md shadow-2xl flex flex-col"
            style={{ backgroundColor: 'var(--color-ivory)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--color-stone)' }}>
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} style={{ color: 'var(--color-walnut)' }} />
                <h2 className="text-lg font-semibold" style={{ color: 'var(--color-charcoal)' }}>Your Cart</h2>
                {lines.length > 0 && (
                  <span className="px-2 py-0.5 text-white text-xs font-semibold rounded-full" style={{ backgroundColor: 'var(--color-walnut)' }}>
                    {cart?.totalQuantity}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 -mr-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {lines.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                  <ShoppingBag size={48} className="text-neutral-200 mb-4" />
                  <p className="text-neutral-500 font-medium">Your cart is empty</p>
                  <p className="text-sm text-neutral-400 mt-1">Add something beautiful to get started</p>
                  <button
                    onClick={closeCart}
                    className="mt-6 px-5 py-2.5 bg-brand-walnut text-white rounded-full hover:bg-brand-walnut-light transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                lines.map((line) => {
                  const image = line.merchandise.product.images.edges[0]?.node;
                  const variantLabel =
                    line.merchandise.title !== 'Default Title' ? line.merchandise.title : null;

                  return (
                    <div key={line.id} className="flex gap-4">
                      {/* Product image */}
                      <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200">
                        {image ? (
                          <Image
                            src={image.url}
                            alt={image.altText ?? line.merchandise.product.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-100" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-neutral-900 leading-tight">
                              {line.merchandise.product.title}
                            </p>
                            {variantLabel && (
                              <p className="text-xs text-neutral-500 mt-0.5">{variantLabel}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromCart(line.id)}
                            className="p-1 text-neutral-300 hover:text-red-500 transition-colors flex-shrink-0"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          {/* Quantity controls */}
                          <div className="flex items-center gap-1 border border-neutral-200 rounded-full px-1">
                            <button
                              onClick={() => updateQuantity(line.id, line.quantity - 1)}
                              disabled={isLoading}
                              className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors disabled:opacity-40"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-sm font-medium text-neutral-900">
                              {line.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(line.id, line.quantity + 1)}
                              disabled={isLoading}
                              className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Line total */}
                          <p className="text-sm font-semibold text-neutral-900">
                            {formatMoney(
                              line.cost.totalAmount.amount,
                              line.cost.totalAmount.currencyCode,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer — only show when cart has items */}
            {lines.length > 0 && (
              <div className="px-6 py-5 space-y-4" style={{ borderTop: '1px solid var(--color-stone)', backgroundColor: 'var(--color-ivory)' }}>
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Subtotal</span>
                  <span className="text-base font-semibold text-neutral-900">
                    {cart && formatMoney(
                      cart.cost.subtotalAmount.amount,
                      cart.cost.subtotalAmount.currencyCode,
                    )}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Shipping and taxes calculated at checkout.
                </p>

                {/* Checkout button */}
                <a
                  href={cart?.checkoutUrl}
                  className="flex items-center justify-center w-full py-4 bg-brand-walnut text-white rounded-full hover:bg-brand-walnut-light transition-colors"
                >
                  Checkout
                </a>

                <button
                  onClick={closeCart}
                  className="w-full py-3 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
