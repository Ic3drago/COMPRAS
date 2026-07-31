'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { ProductCategory } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShoppingBag, RefreshCw } from 'lucide-react';
import { INITIAL_PRODUCTS } from '@/lib/mockData';

const CATEGORIES: ProductCategory[] = [
  'Todos',
  'Abarrotes',
  'Bebidas',
  'Lácteos y Huevos',
  'Snacks y Galletas',
  'Panadería',
  'Limpieza',
  'Cuidado Personal'
];

export function ProductGrid() {
  const { 
    products, 
    searchQuery, 
    selectedCategory, 
    setSelectedCategory, 
    addToCart,
    addProduct,
    showToast
  } = useStore();

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.barcode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleResetCatalog = () => {
    INITIAL_PRODUCTS.forEach(item => {
      if (!products.some(p => p.barcode === item.barcode)) {
        addProduct({
          name: item.name,
          barcode: item.barcode,
          category: item.category,
          unit: item.unit,
          costPrice: item.costPrice,
          salePrice: item.salePrice,
          stock: item.stock,
          minStock: item.minStock
        });
      }
    });
    showToast('Catálogo de productos de ejemplo cargado', 'success');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-black">
      
      {/* Botones de Filtro por Categorías (Barra Superior Táctica) */}
      <div className="px-6 pt-4 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-zinc-900/60 bg-zinc-950/40">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-mono tracking-wider whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/60 font-bold shadow-lg shadow-cyan-950/30'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid de Productos */}
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        {filteredProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <ShoppingBag className="w-16 h-16 text-zinc-700" />
            <div>
              <h3 className="text-zinc-300 font-bold tracking-widest text-lg">NO HAY PRODUCTOS PARA MOSTRAR</h3>
              <p className="text-zinc-500 font-mono text-xs mt-1">
                No hay productos en &quot;{selectedCategory}&quot; o con la búsqueda actual.
              </p>
            </div>
            <button
              onClick={handleResetCatalog}
              className="mt-4 px-6 py-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30 font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Cargar Catálogo Completo
            </button>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.04
                }
              }
            }}
          >
            <AnimatePresence>
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock === 0;
                const isLowStock = product.stock <= product.minStock;

                return (
                  <motion.div
                    key={product.id}
                    layout
                    variants={{
                      hidden: { opacity: 0, scale: 0.95, y: 10 },
                      show: { opacity: 1, scale: 1, y: 0 }
                    }}
                    className={`brutalist-card p-4 relative group flex flex-col justify-between transition-all ${
                      isOutOfStock ? 'opacity-50 grayscale border-rose-900/40 bg-zinc-950' : 'hover:border-cyan-500/50'
                    }`}
                  >
                    {/* Indicador Lateral de Stock */}
                    <div className={`absolute top-0 right-0 w-1.5 h-full ${
                      isOutOfStock ? 'bg-rose-500' : 
                      isLowStock ? 'bg-amber-500' : 'bg-emerald-500/40'
                    }`} />

                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] text-zinc-500 font-mono tracking-wider">
                          {product.barcode}
                        </span>
                        <span className="text-[10px] text-cyan-400/80 font-mono bg-cyan-950/60 px-1.5 py-0.5 border border-cyan-900/50">
                          {product.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-100 leading-snug group-hover:text-cyan-300 transition-colors mt-2">
                        {product.name}
                      </h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-900/80 space-y-3">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-[10px] text-zinc-500 font-mono uppercase">Precio Venta</div>
                          <div className="text-xl text-emerald-400 numeric-mono font-bold">
                            ${product.salePrice.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-zinc-500 font-mono uppercase">Stock</div>
                          <div className={`text-xs numeric-mono font-bold ${
                            isOutOfStock ? 'text-rose-500' : isLowStock ? 'text-amber-400' : 'text-zinc-300'
                          }`}>
                            {product.stock} {product.unit}
                          </div>
                        </div>
                      </div>

                      {/* Botón Acción interactivo */}
                      <button
                        onClick={() => addToCart(product)}
                        disabled={isOutOfStock}
                        className={`w-full py-2.5 px-3 text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all ${
                          isOutOfStock
                            ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                            : 'bg-zinc-900 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 shadow-md'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>{isOutOfStock ? 'Agotado' : 'Agregar +'}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
