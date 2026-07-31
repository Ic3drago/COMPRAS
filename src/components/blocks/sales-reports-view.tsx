"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Trash2, TrendingUp, Calendar, CheckCircle2, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteSale } from "@/app/actions/sales"
import { cn } from "@/lib/utils"

export const SalesReportsView = ({ initialSales, isDark = false }: { initialSales: any[], isDark?: boolean }) => {
  const [sales, setSales] = React.useState(initialSales)
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm("¿Anular esta venta y devolver stock?")) return;
    setIsProcessing(true);
    const res = await deleteSale(id);
    if (res.success) {
      setSales(sales.filter(s => s.id !== id));
    } else {
      alert("Error al eliminar venta");
    }
    setIsProcessing(false);
  }

  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total_amount, 0)
  const totalSales = sales.length

  return (
    <div className={cn("p-6 md:p-8 space-y-8 min-h-full transition-colors", isDark ? "bg-zinc-900/50" : "bg-zinc-50")}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={cn("text-2xl font-bold tracking-tight", isDark ? "text-zinc-100" : "text-zinc-900")}>Reporte de Ventas</h2>
          <p className={isDark ? "text-zinc-400" : "text-zinc-500"}>Historial y anulación de transacciones</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => window.print()} variant="outline" className={cn("hidden md:flex gap-2 h-auto py-2 rounded-xl border transition-colors", isDark ? "bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100")}>
            <FileDown className="w-4 h-4" /> Descargar PDF
          </Button>
          <div className={cn("px-4 py-2 rounded-xl text-center shadow-sm border transition-colors", isDark ? "bg-zinc-800/50 border-zinc-700" : "bg-white border-zinc-200")}>
            <p className="text-xs text-zinc-500 uppercase font-semibold">Total Ingresos</p>
            <p className={cn("text-lg font-bold", isDark ? "text-cyan-400" : "text-emerald-600")}>Bs. {totalRevenue.toFixed(2)}</p>
          </div>
          <div className={cn("px-4 py-2 rounded-xl text-center shadow-sm border transition-colors", isDark ? "bg-zinc-800/50 border-zinc-700" : "bg-white border-zinc-200")}>
            <p className="text-xs text-zinc-500 uppercase font-semibold">Ventas</p>
            <p className={cn("text-lg font-bold", isDark ? "text-indigo-400" : "text-blue-600")}>{totalSales}</p>
          </div>
        </div>
      </div>

      <div className={cn("rounded-2xl overflow-hidden shadow-sm border transition-colors", isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200")}>
        <table className="w-full text-sm text-left">
          <thead className={cn("font-medium border-b transition-colors", isDark ? "bg-zinc-800/50 text-zinc-400 border-zinc-800" : "bg-zinc-100/50 text-zinc-500 border-zinc-200")}>
            <tr>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Código</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className={cn("divide-y transition-colors", isDark ? "divide-zinc-800" : "divide-zinc-100")}>
            {sales.map((sale) => (
              <tr key={sale.id} className={cn("transition-colors", isDark ? "hover:bg-zinc-800/30 text-zinc-300" : "hover:bg-zinc-50 text-zinc-600")}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    {new Date(sale.timestamp).toLocaleString()}
                  </div>
                </td>
                <td className={cn("px-6 py-4 font-mono text-xs", isDark ? "text-zinc-500" : "text-zinc-500")}>{sale.code}</td>
                <td className="px-6 py-4">
                  {sale.items?.length || 0} prod(s).
                </td>
                <td className={cn("px-6 py-4 font-bold", isDark ? "text-cyan-400" : "text-emerald-600")}>Bs. {sale.total_amount.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full w-max", isDark ? "text-cyan-400 bg-cyan-950/50" : "text-emerald-600 bg-emerald-50")}>
                    <CheckCircle2 className="w-3 h-3" /> Completado
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleDelete(sale.id)}
                    className={isDark ? "text-red-400 hover:text-red-300 hover:bg-red-950/50" : "text-red-500 hover:text-red-600 hover:bg-red-50"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={6} className={cn("px-6 py-12 text-center", isDark ? "text-zinc-500" : "text-zinc-500")}>
                  No hay ventas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
