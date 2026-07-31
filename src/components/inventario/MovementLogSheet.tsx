'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { X, ArrowUpRight, ArrowDownLeft, RefreshCw, Barcode } from 'lucide-react';
import { motion } from 'framer-motion';

interface MovementLogSheetProps {
  onClose: () => void;
}

export const MovementLogSheet: React.FC<MovementLogSheetProps> = ({ onClose }) => {
  const { movements } = useStore();

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full flex flex-col justify-between shadow-2xl"
      >
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-100">Kardex / Movimientos</h3>
            <p className="text-xs text-zinc-400">Historial completo de entradas y salidas</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 p-2 rounded-xl hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {movements.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-10">No hay movimientos registrados.</p>
          ) : (
            movements.map((mov) => (
              <div
                key={mov.id}
                className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {mov.type === 'entrada' ? (
                      <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      </span>
                    ) : mov.type === 'salida' ? (
                      <span className="p-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <span className="text-xs font-bold text-zinc-100">{mov.productName}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-200">
                    {mov.type === 'salida' ? '-' : '+'}{mov.quantity}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span>Stock ant: {mov.previousStock} → nuevo: {mov.newStock}</span>
                  <span>{new Date(mov.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <p className="text-[11px] text-zinc-400 italic">
                  Motivo: {mov.reason}
                </p>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};
