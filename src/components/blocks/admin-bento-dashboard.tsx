"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Store, Package, TrendingUp, LogOut, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { type Product } from "@/app/actions/inventory"
import { logout } from "@/app/actions/auth"
import { SivmDashboard } from "./sivm-pos-dashboard"
import { WarehouseView } from "./warehouse-view"
import { SalesReportsView } from "./sales-reports-view"

export const AdminBentoDashboard = ({ initialProducts, initialSales }: { initialProducts: Product[], initialSales: any[] }) => {
  const [activeTab, setActiveTab] = React.useState<'pos' | 'warehouse' | 'reports'>('pos')
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark')

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')
  const isDark = theme === 'dark'

  return (
    <div className={cn("min-h-screen font-sans p-4 md:p-8 transition-colors duration-500", isDark ? "bg-zinc-950 text-white selection:bg-cyan-500/30" : "bg-zinc-50 text-zinc-950 selection:bg-black/10")}>
      
      {/* Header Bento Block */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 mb-6">
        
        {/* Profile / Context Block */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("border rounded-3xl p-6 lg:w-1/3 flex flex-col justify-between shadow-sm transition-colors", isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200")}
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", isDark ? "bg-cyan-500/20 text-cyan-400" : "bg-zinc-950 text-white")}>
                <Store className="h-6 w-6" />
              </div>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className={isDark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-900"}>
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Panel de Administrador</h1>
            <p className={isDark ? "text-zinc-400 text-sm" : "text-zinc-500 text-sm"}>Gestión Total SIVM</p>
          </div>
          
          <form action={logout} className="mt-8">
            <Button type="submit" variant="outline" className={cn("w-full justify-start gap-2 h-12 rounded-xl transition-colors", isDark ? "border-zinc-800 text-zinc-300 hover:text-rose-400 hover:bg-rose-950/30" : "text-zinc-600 hover:text-red-600 hover:bg-red-50 border-zinc-200")}>
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </Button>
          </form>
        </motion.div>

        {/* Navigation Bento Blocks */}
        <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <BentoNavCard 
            title="Punto de Venta"
            subtitle="Caja registradora"
            icon={<Store />}
            isActive={activeTab === 'pos'}
            onClick={() => setActiveTab('pos')}
            isDark={isDark}
          />
          <BentoNavCard 
            title="Almacén"
            subtitle="Inventario"
            icon={<Package />}
            isActive={activeTab === 'warehouse'}
            onClick={() => setActiveTab('warehouse')}
            isDark={isDark}
          />
          <BentoNavCard 
            title="Reportes"
            subtitle="Historial de Ventas"
            icon={<TrendingUp />}
            isActive={activeTab === 'reports'}
            onClick={() => setActiveTab('reports')}
            isDark={isDark}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn("max-w-7xl mx-auto border rounded-3xl shadow-sm overflow-y-auto h-[calc(100vh-140px)] transition-colors custom-scrollbar", isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200")}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'pos' && (
            <motion.div key="pos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SivmDashboard initialProducts={initialProducts} minimalist={!isDark} />
            </motion.div>
          )}
          {activeTab === 'warehouse' && (
            <motion.div key="warehouse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WarehouseView initialProducts={initialProducts} minimalist={!isDark} />
            </motion.div>
          )}
          {activeTab === 'reports' && (
            <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SalesReportsView initialSales={initialSales} isDark={isDark} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function BentoNavCard({ title, subtitle, icon, isActive, onClick, isDark }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-start justify-between p-6 rounded-3xl text-left border transition-all h-full",
        isActive 
          ? (isDark ? "bg-cyan-500 border-cyan-400 text-black shadow-xl shadow-cyan-500/20" : "bg-zinc-950 border-zinc-950 text-white shadow-xl shadow-zinc-200")
          : (isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 shadow-sm" : "bg-white border-zinc-200 text-zinc-950 hover:border-zinc-300 shadow-sm")
      )}
    >
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-4", isActive ? "bg-black/10" : (isDark ? "bg-zinc-800" : "bg-zinc-100"))}>
        {React.cloneElement(icon as any, { className: "w-5 h-5" })}
      </div>
      <div>
        <h3 className="font-bold text-lg tracking-tight">{title}</h3>
        <p className={cn("text-sm", isActive ? (isDark ? "text-zinc-800" : "text-zinc-400") : "text-zinc-500")}>{subtitle}</p>
      </div>
    </motion.button>
  )
}
