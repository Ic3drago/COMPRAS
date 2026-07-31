'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { PaymentMethod } from '@/lib/types';
import { CheckCircle2, DollarSign, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

export function PaymentModal({ isOpen, onClose, total }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { processSale } = useStore();

  const handlePayment = () => {
    setIsProcessing(true);
    // Simular procesamiento
    setTimeout(async () => {
      setIsProcessing(false);
      const sale = processSale(method, total);
      const saleResult = await sale;
      if (saleResult) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 1500);
      } else {
        // En caso de fallo
        onClose();
      }
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={!isProcessing && !isSuccess ? onClose : undefined}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-md brutalist-panel bg-zinc-950 p-8 shadow-2xl relative z-10"
          >
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 gap-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <CheckCircle2 className="w-24 h-24 text-emerald-500" />
                </motion.div>
                <div className="text-2xl font-bold tracking-widest text-zinc-100">PAGO APROBADO</div>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-8 tracking-widest border-b border-zinc-900 pb-4">PROCESAR PAGO</h3>
                
                <div className="text-center mb-8">
                  <div className="text-sm text-zinc-500 font-mono mb-2">TOTAL A COBRAR</div>
                  <div className="text-5xl numeric-mono text-emerald-400 font-bold">${total.toFixed(2)}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    onClick={() => setMethod('cash')}
                    className={`h-20 flex flex-col items-center justify-center gap-2 border transition-colors ${
                      method === 'cash' 
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' 
                        : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <DollarSign size={24} />
                    <span className="text-xs font-mono font-bold tracking-widest uppercase">Efectivo</span>
                  </button>
                  <button
                    onClick={() => setMethod('card')}
                    className={`h-20 flex flex-col items-center justify-center gap-2 border transition-colors ${
                      method === 'card' 
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' 
                        : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <CreditCard size={24} />
                    <span className="text-xs font-mono font-bold tracking-widest uppercase">Tarjeta</span>
                  </button>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={onClose}
                    disabled={isProcessing}
                    className="flex-1 py-4 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors font-mono tracking-widest text-sm disabled:opacity-50"
                  >
                    CANCELAR
                  </button>
                  <motion.button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    whileHover={{ scale: 0.98 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="flex-1 py-4 bg-emerald-500 text-black font-bold tracking-widest text-sm hover:bg-emerald-400 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition-colors flex justify-center items-center"
                  >
                    {isProcessing ? (
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                      />
                    ) : (
                      'CONFIRMAR PAGO'
                    )}
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
