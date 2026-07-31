"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ShoppingCart, LogOut, Package, CreditCard, ChevronRight, X, Plus, Minus, ScanBarcode } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type Product } from "@/app/actions/inventory"
import { createSale } from "@/app/actions/sales"
import { logout } from "@/app/actions/auth"
import Image from "next/image"

export const SellerSpatialDashboard = ({ initialProducts }: { initialProducts: Product[] }) => {
  const [products, setProducts] = React.useState<Product[]>(initialProducts)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [cart, setCart] = React.useState<{ product: Product; quantity: number }[]>([])
  const [isProcessing, setIsProcessing] = React.useState(false)

  // Filter only items with stock
  const availableProducts = products.filter(p => p.stock > 0)
  
  const filteredProducts = availableProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.sale_price * item.quantity), 0)

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return prev // Can't add more than stock
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQ = item.quantity + delta;
        if (newQ < 1 || newQ > item.product.stock) return item;
        return { ...item, quantity: newQ }
      }
      return item;
    }))
  }

  const [isWarehouseMode, setIsWarehouseMode] = React.useState(false)

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    
    const items = cart.map(c => ({
      product: c.product,
      quantity: c.quantity,
      discountPercentage: 0,
      unitPrice: c.product.sale_price,
      total: c.product.sale_price * c.quantity
    }));

    const tax = cartTotal * 0.16; // 16% tax for example
    
    const res = await createSale({
      items,
      subtotal: cartTotal - tax,
      taxAmount: tax,
      discountAmount: 0,
      totalAmount: cartTotal,
      paymentMethod: 'cash',
      amountPaid: cartTotal,
      changeGiven: 0,
      cashierName: 'Vendedor'
    });

    if (res.success) {
      alert("Venta completada con éxito");
      // Update local stock to reflect purchase
      setProducts(prev => prev.map(p => {
        const cartItem = cart.find(c => c.product.id === p.id);
        if (cartItem) {
          return { ...p, stock: p.stock - cartItem.quantity };
        }
        return p;
      }));
      setCart([]);
    } else {
      alert("Error procesando venta");
    }
    
    setIsProcessing(false);
  }

  return (
    <div className="h-screen bg-zinc-950 text-white font-sans flex flex-col relative selection:bg-cyan-500/30">
      {/* Background Spatial Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/20 backdrop-blur-3xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ScanBarcode className="text-zinc-950 h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">Mostrador Vendedor</h1>
            <p className="text-zinc-400 text-sm">Punto de Venta Inmersivo</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setIsWarehouseMode(!isWarehouseMode)}
            className="h-12 px-6 rounded-2xl bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-all backdrop-blur-md"
          >
            <Package className="w-4 h-4 mr-2" />
            {isWarehouseMode ? "Volver a Ventas" : "Ver Almacén"}
          </Button>

          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar repuestos, códigos..."
              className="w-full bg-white/5 border-white/10 rounded-2xl pl-12 h-12 text-white placeholder:text-zinc-500 focus-visible:ring-cyan-500/50 transition-all backdrop-blur-md"
            />
          </div>
          <form action={logout}>
            <Button variant="ghost" size="icon" type="submit" className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 border border-white/10 text-zinc-400 transition-all backdrop-blur-md">
              <LogOut className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </header>

      {/* Main Layout: Products Grid (Left) + Cart (Right) */}
      <div className="flex-1 relative z-10 flex overflow-hidden">
        
        {/* Products Grid or Warehouse */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isWarehouseMode ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <h2 className="text-xl font-bold mb-6 text-cyan-400">Inventario Actual</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-zinc-400 border-b border-white/10">
                    <tr>
                      <th className="pb-4 font-medium">Código</th>
                      <th className="pb-4 font-medium">Producto</th>
                      <th className="pb-4 font-medium">Stock</th>
                      <th className="pb-4 font-medium">Precio Venta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 font-mono text-zinc-500">{p.barcode}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            {p.image && <img src={p.image} className="w-8 h-8 rounded-lg object-cover" />}
                            <span>{p.name}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={cn("px-2 py-1 rounded-full text-xs font-semibold", p.stock <= p.min_stock ? "bg-red-500/20 text-red-400" : "bg-cyan-500/20 text-cyan-400")}>
                            {p.stock} {p.unit}
                          </span>
                        </td>
                        <td className="py-4 font-bold text-white">Bs. {p.sale_price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToCart(product)}
                  className="group relative flex flex-col bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md cursor-pointer hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all"
                >
                  <div className="aspect-square w-full relative bg-zinc-900/50">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-lighten group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-zinc-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/10">
                      {product.stock} en stock
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between z-10">
                    <div>
                      <p className="text-xs text-cyan-400 font-medium mb-1 line-clamp-1">{product.category}</p>
                      <h3 className="text-sm font-semibold text-zinc-100 line-clamp-2 leading-tight">{product.name}</h3>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-white">Bs. {product.sale_price.toFixed(2)}</span>
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500 text-cyan-400 group-hover:text-black transition-colors">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <Package className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
                <p className="text-zinc-500 text-lg">No se encontraron productos en stock.</p>
              </div>
            )}
          </div>
          )}
        </div>

        {/* Cart / Vista Previa de Compras */}
        <div className="w-[400px] border-l border-white/10 bg-black/40 backdrop-blur-xl flex flex-col z-20 shadow-2xl">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-cyan-400" />
              Vista Previa de Compra
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.product.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.9 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 relative group"
                >
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-400 shadow-lg text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 overflow-hidden flex-shrink-0">
                      {item.product.image ? (
                        <img src={item.product.image} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <Package className="w-full h-full p-3 text-zinc-700" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-zinc-200 line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-zinc-500 mb-2">Bs. {item.product.sale_price.toFixed(2)} c/u</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-black/50 rounded-lg p-1 border border-white/5">
                          <button onClick={() => updateQuantity(item.product.id, -1)} className="w-6 h-6 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 text-white disabled:opacity-50" disabled={item.quantity <= 1}>
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 text-white disabled:opacity-50" disabled={item.quantity >= item.product.stock}>
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-cyan-400">Bs. {(item.quantity * item.product.sale_price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-12">
                <ShoppingCart className="w-12 h-12 mb-4 text-zinc-600" />
                <p className="text-sm text-zinc-400">El ticket está vacío.<br/>Selecciona productos para cobrar.</p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-white/10 bg-white/5 backdrop-blur-md">
            <div className="flex justify-between items-center mb-6">
              <span className="text-zinc-400">Total a cobrar</span>
              <span className="text-3xl font-bold text-white tracking-tight">
                Bs. {cartTotal.toFixed(2)}
              </span>
            </div>
            
            <Button 
              onClick={handleCheckout} 
              disabled={cart.length === 0 || isProcessing}
              className="w-full h-14 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl text-lg font-bold shadow-xl shadow-cyan-500/25 transition-all disabled:opacity-50 border-0"
            >
              {isProcessing ? "Procesando..." : "Cobrar Compra"}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
