"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Package, Search, Plus, Trash2, Settings, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { type Product, createProduct, deleteProduct } from "@/app/actions/inventory"

export const WarehouseView = ({ initialProducts, minimalist = false }: { initialProducts: Product[], minimalist?: boolean }) => {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [products, setProducts] = React.useState<Product[]>(initialProducts)
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const outOfStock = products.filter(p => p.stock <= 0).length
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.min_stock).length

  const handleDelete = async (id: string) => {
    if(!confirm("¿Eliminar este producto?")) return;
    const res = await deleteProduct(id);
    if(res.success) {
      setProducts(products.filter(p => p.id !== id));
    }
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      barcode: formData.get('barcode') as string,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      unit: formData.get('unit') as string,
      cost_price: Number(formData.get('cost_price')),
      sale_price: Number(formData.get('sale_price')),
      stock: Number(formData.get('stock')),
      min_stock: Number(formData.get('min_stock')),
      image: null
    };

    const res = await createProduct(data);
    if(res.success) {
      setIsAddModalOpen(false);
      // Optimistic or real fetch (for simplicity we reload)
      window.location.reload();
    }
  }

  return (
    <div className={cn("flex flex-col h-full", minimalist ? "p-0" : "p-4 md:p-8 min-h-screen bg-zinc-950 text-zinc-100")}>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className={cn("p-6 rounded-3xl flex items-center gap-4", minimalist ? "bg-white border border-zinc-200" : "bg-zinc-900/60 border border-zinc-800")}>
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-sm">Total Productos</p>
            <p className={cn("text-2xl font-bold", minimalist ? "text-zinc-900" : "text-white")}>{products.length}</p>
          </div>
        </div>
        
        <div className={cn("p-6 rounded-3xl flex items-center gap-4", minimalist ? "bg-white border border-zinc-200" : "bg-zinc-900/60 border border-zinc-800")}>
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-sm">Stock Crítico</p>
            <p className="text-2xl font-bold text-amber-500">{lowStock}</p>
          </div>
        </div>

        <div className={cn("p-6 rounded-3xl flex items-center gap-4", minimalist ? "bg-white border border-zinc-200" : "bg-zinc-900/60 border border-zinc-800")}>
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-sm">Agotados</p>
            <p className="text-2xl font-bold text-red-500">{outOfStock}</p>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className={cn("flex-1 rounded-3xl p-6 flex flex-col", minimalist ? "bg-white" : "bg-zinc-900/40 border border-zinc-800")}>
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-400" />
            </div>
            <Input 
              type="text"
              placeholder="Buscar producto..."
              className={cn("pl-10 h-10 rounded-xl w-full", minimalist ? "bg-zinc-50 border-zinc-200" : "bg-zinc-950/50 border-zinc-800")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className={cn("gap-2", minimalist ? "bg-zinc-900 text-white" : "")}>
            <Plus className="h-4 w-4" /> Nuevo Producto
          </Button>
        </div>

        <div className={cn("flex-1 overflow-auto rounded-2xl", minimalist ? "border border-zinc-200 bg-white" : "border border-zinc-800/50 bg-zinc-950/30")}>
          <table className="w-full text-sm text-left">
            <thead className={cn("text-xs uppercase sticky top-0 z-10", minimalist ? "bg-zinc-50 text-zinc-500" : "bg-zinc-900/50 text-zinc-400 backdrop-blur-md")}>
              <tr>
                <th className="px-6 py-4 font-medium">Código</th>
                <th className="px-6 py-4 font-medium">Producto</th>
                <th className="px-6 py-4 font-medium">Venta</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", minimalist ? "divide-zinc-100" : "divide-zinc-800/50")}>
              {filteredProducts.map((product) => (
                <tr key={product.id} className={minimalist ? "hover:bg-zinc-50" : "hover:bg-zinc-900/30"}>
                  <td className="px-6 py-4 font-mono text-zinc-500 text-xs">{product.barcode}</td>
                  <td className={cn("px-6 py-4 font-medium", minimalist ? "text-zinc-900" : "text-zinc-200")}>{product.name}</td>
                  <td className="px-6 py-4 font-mono font-medium text-emerald-600">Bs. {product.sale_price.toFixed(2)}</td>
                  <td className="px-6 py-4 font-mono">
                    {product.stock} {product.unit}
                  </td>
                  <td className="px-6 py-4">
                    {product.stock <= 0 ? (
                      <span className="text-xs text-red-500 font-medium">Agotado</span>
                    ) : product.stock <= product.min_stock ? (
                      <span className="text-xs text-amber-500 font-medium">Crítico</span>
                    ) : (
                      <span className="text-xs text-emerald-500 font-medium">Normal</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold mb-4 text-zinc-900">Añadir Producto</h3>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500">Código</label>
                    <Input name="barcode" required className="bg-zinc-50 border-zinc-200 text-zinc-900" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500">Categoría</label>
                    <Input name="category" required className="bg-zinc-50 border-zinc-200 text-zinc-900" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500">Nombre</label>
                  <Input name="name" required className="bg-zinc-50 border-zinc-200 text-zinc-900" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500">Unidad</label>
                    <Input name="unit" required defaultValue="u" className="bg-zinc-50 border-zinc-200 text-zinc-900" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500">Costo</label>
                    <Input name="cost_price" type="number" step="0.01" required className="bg-zinc-50 border-zinc-200 text-zinc-900" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500">Precio</label>
                    <Input name="sale_price" type="number" step="0.01" required className="bg-zinc-50 border-zinc-200 text-zinc-900" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500">Stock Inicial</label>
                    <Input name="stock" type="number" required className="bg-zinc-50 border-zinc-200 text-zinc-900" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500">Stock Mínimo</label>
                    <Input name="min_stock" type="number" required className="bg-zinc-50 border-zinc-200 text-zinc-900" />
                  </div>
                </div>
                <Button className="w-full bg-zinc-900 text-white mt-4">Guardar Producto</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
