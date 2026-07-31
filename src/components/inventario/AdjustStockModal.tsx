'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Product } from '@/lib/types';
import { X, RefreshCw, PlusCircle, MinusCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdjustStockModalProps {
  product: Product;
  onClose: () => void;
}

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({ product, onClose }) => {
  const { adjustProductStock } = useStore();
  const [type, setType] = useState<'entrada' | 'salida' | 'ajuste'>('entrada');
  const [quantity, setQuantity] = useState<string>('5');
  const [reason, setReason] = useState<string>('Recepción de mercancía nueva');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = parseInt(quantity) || 0;
    if (q <= 0) return;

    const delta = type === 'salida' ? -q : q;
    adjustProductStock(product.id, delta, reason, type);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-7 max-w-md w-full shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-100">Ajuste de Stock Manual</h3>
            <p className="text-xs text-zinc-400 truncate max-w-[260px]">{product.name}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 p-2 rounded-xl hover:bg-zinc-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Tipo de Ajuste</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'entrada', label: 'Entrada (+)' },
                { id: 'salida', label: 'Salida (-)' },
                { id: 'ajuste', label: 'Corrección' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    type === item.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Cantidad de Unidades</label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-base font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Motivo u Observación</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. Compra a proveedor #102, merma..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/40"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar Inventario</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};
