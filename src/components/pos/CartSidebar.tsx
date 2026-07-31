'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentModal } from './PaymentModal';

export function CartSidebar() {
  const { cart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartSubtotal, cartTaxAmount } = useStore();
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);

  return (
    <aside className="w-96 h-full flex flex-col bg-zinc-950/80 backdrop-blur-xl border-l border-zinc-900/50 shrink-0 relative z-20">
      
      {/* Header Carrito */}
      <div className="h-24 shrink-0 flex items-center justify-between px-6 border-b border-zinc-900/50">
        <h2 className="text-xl font-bold tracking-widest text-zinc-100">CAJA</h2>
        <button 
          onClick={clearCart}
          disabled={cart.length === 0}
          className="text-xs font-mono text-rose-500/70 hover:text-rose-500 disabled:opacity-30 transition-colors uppercase tracking-widest"
        >
          Limpiar
        </button>
      </div>

      {/* Lista de Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence initial={false}>
          {cart.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-zinc-600 font-mono text-sm"
            >
              SIN ARTÍCULOS
            </motion.div>
          ) : (
            cart.map((item) => (
              <motion.div
                key={item.product.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.1 } }}
                className="brutalist-panel p-3 flex flex-col gap-2 group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] text-zinc-500 font-mono mb-1">{item.product.barcode}</div>
                    <div className="text-sm text-zinc-200 line-clamp-2">{item.product.name}</div>
                  </div>
                  <div className="text-sm text-emerald-400 numeric-mono font-medium whitespace-nowrap ml-2">
                    ${item.total.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-none h-8">
                    <button 
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center numeric-mono text-xs font-medium">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-zinc-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Totales y Cobro */}
      <div className="shrink-0 border-t border-zinc-900/50 bg-black/50 p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2 text-sm text-zinc-400 font-mono">
          <div className="flex justify-between">
            <span>SUBTOTAL</span>
            <span className="numeric-mono text-zinc-200">${cartSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>IVA (16%)</span>
            <span className="numeric-mono text-zinc-200">${cartTaxAmount.toFixed(2)}</span>
          </div>
          <div className="h-px w-full bg-zinc-800 my-2" />
          <div className="flex justify-between items-end">
            <span className="text-base text-zinc-300">TOTAL</span>
            <span className="text-3xl numeric-mono font-bold text-emerald-400">${cartTotal.toFixed(2)}</span>
          </div>
        </div>

        <motion.button
          disabled={cart.length === 0}
          whileHover={cart.length > 0 ? { scale: 0.98 } : {}}
          whileTap={cart.length > 0 ? { scale: 0.95 } : {}}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => setIsPaymentOpen(true)}
          className="w-full h-16 bg-emerald-500 text-black font-bold tracking-widest text-lg mt-4 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
        >
          <CreditCard size={24} />
          <span>COBRAR</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
        </motion.button>
      </div>

      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        total={cartTotal}
      />
    </aside>
  );
}
