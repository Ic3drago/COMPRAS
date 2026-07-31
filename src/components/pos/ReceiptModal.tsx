'use client';

import React from 'react';
import { SaleTransaction } from '@/lib/types';
import { Printer, CheckCircle2, Store, X, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReceiptModalProps {
  transaction: SaleTransaction;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-7 max-w-md w-full shadow-2xl space-y-6 select-none"
      >
        {/* Success Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h3 className="text-xl font-extrabold text-zinc-100">Venta Exitosa</h3>
          <p className="text-xs text-zinc-400 font-mono">Ticket #{transaction.code}</p>
        </div>

        {/* Receipt Ticket Box */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 font-mono text-xs text-zinc-300">
          <div className="text-center pb-3 border-b border-dashed border-zinc-800 space-y-1">
            <h4 className="font-bold text-sm text-zinc-100 tracking-wider">MICROMERCADO SIVM</h4>
            <p className="text-[10px] text-zinc-400">NIT: 900.849.201-4</p>
            <p className="text-[10px] text-zinc-400">
              {new Date(transaction.timestamp).toLocaleString('es-ES')}
            </p>
            <p className="text-[10px] text-zinc-400">Cajero: {transaction.cashierName}</p>
          </div>

          {/* Items breakdown */}
          <div className="space-y-2 py-2 border-b border-dashed border-zinc-800 max-h-48 overflow-y-auto">
            {transaction.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-[11px]">
                <div className="pr-2">
                  <span className="block font-semibold text-zinc-200">{item.product.name}</span>
                  <span className="text-zinc-400">
                    {item.quantity} x ${item.unitPrice.toFixed(2)}
                    {item.discountPercentage > 0 && ` (-${item.discountPercentage}%)`}
                  </span>
                </div>
                <span className="font-bold text-zinc-100 font-mono">${item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Financial Totals */}
          <div className="space-y-1 pt-1 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal:</span>
              <span>${transaction.subtotal.toFixed(2)}</span>
            </div>
            {transaction.discountAmount > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>Descuento:</span>
                <span>-${transaction.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-400">
              <span>IVA (16%):</span>
              <span>${transaction.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-emerald-400 pt-2 border-t border-zinc-800">
              <span>TOTAL:</span>
              <span>${transaction.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-zinc-400 pt-2">
              <span>Método Pago ({transaction.paymentMethod.toUpperCase()}):</span>
              <span>${transaction.amountPaid.toFixed(2)}</span>
            </div>
            {transaction.paymentMethod === 'cash' && (
              <div className="flex justify-between text-[11px] text-emerald-400">
                <span>Vueltos / Cambio:</span>
                <span>${transaction.changeGiven.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handlePrint}
            className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir Ticket
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-950/40"
          >
            <span>Nueva Venta</span>
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
