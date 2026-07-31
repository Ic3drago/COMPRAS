"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ShoppingCart, Package, AlertCircle, Loader2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type Product, checkoutCart } from "@/app/actions/inventory"
import Image from "next/image"

const PHYSICS_SPRING = { type: "spring" as const, stiffness: 300, damping: 25 }

export const SivmDashboard = ({ initialProducts, minimalist = false }: { initialProducts: Product[], minimalist?: boolean }) => {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [products, setProducts] = React.useState<Product[]>(initialProducts)
  const [cart, setCart] = React.useState<{id: string, name: string, price: number, qty: number}[]>([])
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState<{text: string, type: 'success' | 'error'} | null>(null)

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.barcode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0)

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return
    
    // Check if adding exceeds current stock
    const existing = cart.find(item => item.id === product.id)
    if (existing && existing.qty >= product.stock) return;

    setCart(prev => {
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      }
      return [...prev, { id: product.id, name: product.name, price: product.sale_price, qty: 1 }]
    })
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setIsProcessing(true)
    
    const res = await checkoutCart(cart)
    if (res.success) {
      // Optimistic update of local products array
      setProducts(prev => prev.map(p => {
        const cartItem = cart.find(c => c.id === p.id)
        if (cartItem) {
          return { ...p, stock: p.stock - cartItem.qty }
        }
        return p;
      }))
      setCart([])
      setToastMessage({ text: "Venta registrada exitosamente", type: 'success' })
    } else {
      setToastMessage({ text: "Error al procesar la venta", type: 'error' })
    }
    setTimeout(() => setToastMessage(null), 3000)
    setIsProcessing(false)
  }

  return (
    <div className={cn("relative overflow-hidden font-sans", minimalist ? "bg-white text-zinc-900 p-0" : "min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 selection:bg-cyan-500/30")}>
      
      {/* Background Ambience (Glassmorphism / Pro Max effects) */}
      {!minimalist && (
        <>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 pt-10 md:pt-0", minimalist ? "" : "mx-auto max-w-7xl")}>
        
        {/* Main POS Column */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={PHYSICS_SPRING}
            className="relative group"
          >
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
              <Search className="h-5 w-5 text-cyan-500" />
            </div>
            <Input 
              type="text"
              placeholder="Buscar producto por código de barras o nombre..."
              className={cn("h-16 pl-12 text-lg backdrop-blur-xl transition-all rounded-2xl", minimalist ? "bg-zinc-50 border-zinc-200 text-zinc-900 focus-visible:ring-zinc-500 shadow-sm" : "bg-zinc-900/60 border-zinc-800/80 text-zinc-100 focus-visible:ring-cyan-500/50 shadow-lg shadow-black/20")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>

          <div className={cn("space-y-4", minimalist ? "p-6" : "")}>
            <h2 className={cn("text-sm font-semibold tracking-widest uppercase flex items-center gap-2", minimalist ? "text-zinc-500" : "text-zinc-400")}>
              <Package className="h-4 w-4" /> Inventario Disponible
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={PHYSICS_SPRING}
                    onClick={() => addToCart(product)}
                    className={cn(
                      "group p-4 rounded-2xl border cursor-pointer backdrop-blur-xl transition-all shadow-md relative overflow-hidden",
                      minimalist ? (
                        product.stock <= 0 ? "bg-zinc-100 border-zinc-200 opacity-50 grayscale" :
                        product.stock <= product.min_stock ? "bg-amber-50 border-amber-200 hover:border-amber-400" : 
                        "bg-white border-zinc-200 hover:border-zinc-400 hover:shadow-lg"
                      ) : (
                        product.stock <= 0 ? "bg-zinc-900/20 border-zinc-800/50 opacity-50 grayscale" :
                        product.stock <= product.min_stock ? "bg-rose-950/10 border-rose-900/50 hover:border-rose-500/60 shadow-rose-900/10" : 
                        "bg-zinc-900/40 border-zinc-800/80 hover:border-cyan-500/50 hover:bg-zinc-800/60 shadow-black/30 hover:shadow-cyan-900/20"
                      )
                    )}
                  >
                    {/* Inner highlight for 3D effect */}
                    {!minimalist && <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}

                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded-full", minimalist ? "bg-zinc-100 text-zinc-500" : "bg-zinc-950/50 text-zinc-500")}>{product.barcode}</span>
                      <span className={cn("text-sm font-bold", minimalist ? "text-zinc-900" : "text-emerald-400")}>Bs. {product.sale_price.toFixed(2)}</span>
                    </div>
                    
                    <h3 className={cn("font-semibold line-clamp-2 relative z-10 h-10", minimalist ? "text-zinc-900" : "text-zinc-100")}>{product.name}</h3>
                    
                    <div className="mt-3 flex items-center justify-between text-xs relative z-10">
                      <span className={cn(
                        "px-2 py-1 rounded-md font-mono font-medium",
                        product.stock <= 0 ? "bg-zinc-950 text-zinc-600" :
                        product.stock <= product.min_stock ? "bg-rose-950/50 text-rose-400 border border-rose-900/50" : 
                        "bg-zinc-950 text-zinc-300 border border-zinc-800"
                      )}>
                        Stock: {product.stock} {product.unit}
                      </span>
                      {product.stock > 0 && product.stock <= product.min_stock && (
                        <span className="flex items-center gap-1 text-rose-500 animate-pulse"><AlertCircle className="h-3 w-3"/> Crítico</span>
                      )}
                      {product.stock <= 0 && (
                        <span className="text-zinc-500 font-medium">Agotado</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sales Cart Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...PHYSICS_SPRING, delay: 0.1 }}
          className={cn(
            "h-[calc(100vh-4rem)] flex flex-col sticky top-8 p-6 rounded-3xl",
            minimalist ? "bg-zinc-50 border border-zinc-200" : "bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl shadow-2xl shadow-black/50"
          )}
        >
          <div className={cn("flex items-center gap-3 pb-4 mb-4", minimalist ? "border-b border-zinc-200" : "border-b border-zinc-800/80")}>
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", minimalist ? "bg-white border border-zinc-200 shadow-sm" : "bg-emerald-500/10")}>
              <ShoppingCart className={cn("h-5 w-5", minimalist ? "text-zinc-900" : "text-emerald-500")} />
            </div>
            <h2 className={cn("text-xl font-semibold", minimalist ? "text-zinc-900" : "bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400")}>Ticket Actual</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            <AnimatePresence>
              {cart.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-zinc-500 text-sm font-medium gap-3"
                >
                  <ShoppingCart className="h-12 w-12 text-zinc-800" />
                  <p>Escanea o selecciona productos</p>
                </motion.div>
              ) : (
                cart.map(item => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, x: 20 }}
                    className={cn(
                      "flex justify-between items-center text-sm p-3 rounded-xl",
                      minimalist ? "bg-white border border-zinc-200" : "bg-zinc-950/50 border border-zinc-800/50"
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className={cn("font-medium", minimalist ? "text-zinc-900" : "text-zinc-200")}>{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-mono", minimalist ? "bg-zinc-100 text-zinc-600" : "bg-zinc-800 text-zinc-300")}>x{item.qty}</span>
                        <span className={cn("text-xs font-mono", minimalist ? "text-zinc-500" : "text-zinc-500")}>Bs. {item.price.toFixed(2)} c/u</span>
                      </div>
                    </div>
                    <span className={cn("font-mono font-bold", minimalist ? "text-zinc-900" : "text-zinc-100")}>Bs. {(item.qty * item.price).toFixed(2)}</span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className={cn("pt-6 mt-4 space-y-6", minimalist ? "border-t border-zinc-200" : "border-t border-zinc-800/80")}>
            <div className={cn("flex justify-between items-end p-4 rounded-2xl", minimalist ? "bg-zinc-900 text-white" : "bg-zinc-950/50 border border-zinc-800/50")}>
              <span className={cn("text-sm font-medium", minimalist ? "text-zinc-400" : "text-zinc-400")}>Total a cobrar:</span>
              <span className={cn("text-3xl font-black tracking-tighter", minimalist ? "text-white" : "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400")}>
                Bs. {cartTotal.toFixed(2)}
              </span>
            </div>
            <Button 
              disabled={cart.length === 0 || isProcessing}
              onClick={handleCheckout}
              className={cn(
                "w-full font-bold h-14 rounded-2xl transition-all",
                minimalist 
                  ? "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-zinc-200 disabled:text-zinc-400" 
                  : "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 shadow-lg shadow-emerald-500/20 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 disabled:shadow-none"
              )}
            >
              {isProcessing ? <Loader2 className="animate-spin h-6 w-6" /> : 'Confirmar e Imprimir Venta'}
            </Button>
          </div>
        </motion.div>

      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className={cn("fixed bottom-8 left-1/2 z-50 px-6 py-3 rounded-full shadow-2xl backdrop-blur-xl border flex items-center gap-2", 
              toastMessage.type === 'error' ? "bg-rose-500/95 text-white border-rose-400" : "bg-emerald-500/95 text-white border-emerald-400"
            )}
          >
            {toastMessage.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            <span className="font-medium text-sm">{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
