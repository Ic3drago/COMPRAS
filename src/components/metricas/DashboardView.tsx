'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { SaleTransaction } from '@/lib/types';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle, 
  Users, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle,
  FileText,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

export const DashboardView: React.FC = () => {
  const { sales, shift, products, cancelSale, lowStockCount } = useStore();

  const completedSales = sales.filter(s => s.status === 'completed');
  const totalRevenue = completedSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalItemsSold = completedSales.reduce((acc, s) => acc + s.items.reduce((iAcc, item) => iAcc + item.quantity, 0), 0);
  const avgTicket = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;

  // Hourly Sales Distribution Mock/Calculated
  const hourlyData = [
    { hour: '08:00', amount: 45.20 },
    { hour: '09:00', amount: 82.50 },
    { hour: '10:00', amount: 110.00 },
    { hour: '11:00', amount: 65.80 },
    { hour: '12:00', amount: 140.30 },
    { hour: '13:00', amount: 95.00 },
    { hour: '14:00', amount: totalRevenue * 0.25 || 120.00 }
  ];

  const maxAmount = Math.max(...hourlyData.map(d => d.amount), 1);

  // Top Selling Categories Breakdown
  const categoryStats = [
    { name: 'Abarrotes', percentage: 38, revenue: totalRevenue * 0.38 },
    { name: 'Bebidas', percentage: 27, revenue: totalRevenue * 0.27 },
    { name: 'Lácteos y Huevos', percentage: 18, revenue: totalRevenue * 0.18 },
    { name: 'Snacks y Otros', percentage: 17, revenue: totalRevenue * 0.17 }
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 gap-6 select-none">
      {/* Dashboard Title & Quick Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Dashboard de Métricas & Rendimiento
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Analítica de operaciones diarias del micromercado en tiempo real
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
          <Calendar className="w-4 h-4 text-sky-400" />
          <span>Jornada Actual ({new Date().toLocaleDateString('es-ES')})</span>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-3"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Ventas Totales</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-zinc-100 font-mono">
            ${totalRevenue.toFixed(2)}
          </h3>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +14.2% respecto a ayer
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-3"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Transacciones</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-zinc-100 font-mono">
            {completedSales.length}
          </h3>
          <span className="text-[11px] text-sky-400 font-medium">
            {totalItemsSold} artículos vendidos
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-3"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Ticket Promedio</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-zinc-100 font-mono">
            ${avgTicket.toFixed(2)}
          </h3>
          <span className="text-[11px] text-purple-400 font-medium">
            Monto promedio por cliente
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-3"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Alertas Stock</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-amber-400 font-mono">
            {lowStockCount}
          </h3>
          <span className="text-[11px] text-amber-400 font-medium">
            Artículos requieren reabastecimiento
          </span>
        </motion.div>
      </div>

      {/* Visual Charts & Category Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Sales Performance SVG Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-zinc-100">Volumen de Ventas por Hora</h4>
              <p className="text-xs text-zinc-400">Comportamiento horario de la caja</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
              Pico: 12:00 PM
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b border-zinc-800">
            {hourlyData.map((d, i) => {
              const heightPercent = (d.amount / maxAmount) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-emerald-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                    ${d.amount.toFixed(0)}
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className="w-full max-w-[36px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg group-hover:brightness-125 transition-all"
                  />
                  <span className="text-[10px] font-mono text-zinc-400">{d.hour}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Share Progress */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 space-y-5">
          <div>
            <h4 className="text-sm font-bold text-zinc-100">Ventas por Categoría</h4>
            <p className="text-xs text-zinc-400">Distribución de ingresos</p>
          </div>

          <div className="space-y-4">
            {categoryStats.map((cat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-zinc-200">{cat.name}</span>
                  <span className="font-mono text-emerald-400 font-bold">${cat.revenue.toFixed(2)} ({cat.percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Ledger Table */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-zinc-100">Libro Diario de Transacciones</h4>
            <p className="text-xs text-zinc-400">Historial completo de comprobantes procesados</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-950 text-zinc-400 text-[11px] uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Código Ticket</th>
                <th className="py-3 px-4">Hora</th>
                <th className="py-3 px-4">Ítems</th>
                <th className="py-3 px-4">Método</th>
                <th className="py-3 px-4 text-right">Monto Total</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs font-medium text-zinc-200">
              {sales.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-zinc-100">{tx.code}</td>
                  <td className="py-3.5 px-4 font-mono text-zinc-400">
                    {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-300">{tx.items.length} productos</td>
                  <td className="py-3.5 px-4 uppercase font-semibold text-zinc-400">{tx.paymentMethod}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                    ${tx.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {tx.status === 'completed' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Completado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Anulado
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {tx.status === 'completed' && (
                      <button
                        onClick={() => cancelSale(tx.id)}
                        className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-semibold transition-colors border border-rose-500/20"
                      >
                        Anular
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
