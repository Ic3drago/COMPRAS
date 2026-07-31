'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Product } from '@/lib/types';
import { Search, Plus, AlertTriangle, ArrowDownUp, Edit3, Trash2 } from 'lucide-react';
import { ProductModal } from './ProductModal';
import { AdjustStockModal } from './AdjustStockModal';

export function InventoryTable() {
  const { products, deleteProduct } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Inventario */}
      <div className="flex justify-between items-end border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-2xl font-black tracking-widest text-zinc-100 uppercase">Control de Inventario</h2>
          <div className="text-zinc-500 font-mono text-sm mt-1">SISTEMA SIVM // BASE DE DATOS Y KARDEX</div>
        </div>
        <button 
          onClick={handleNewProduct}
          className="bg-zinc-100 text-black px-6 py-3 font-mono font-bold tracking-widest text-sm hover:bg-white transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          NUEVO PRODUCTO
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 items-center bg-zinc-900/30 p-4 border border-zinc-800">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, código o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 brutalist-input rounded-none pl-10 pr-4 text-sm font-mono placeholder:text-zinc-600 focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        <div className="text-xs text-zinc-500 font-mono">
          TOTAL PRODUCTOS: <span className="text-cyan-400 font-bold">{filteredProducts.length}</span>
        </div>
      </div>

      {/* Tabla Brutalista */}
      <div className="flex-1 overflow-auto border border-zinc-800 bg-zinc-950">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs font-mono tracking-widest text-zinc-400">
              <th className="p-4 font-normal">CÓDIGO</th>
              <th className="p-4 font-normal">PRODUCTO</th>
              <th className="p-4 font-normal">CATEGORÍA</th>
              <th className="p-4 font-normal text-right">PRECIO COSTO</th>
              <th className="p-4 font-normal text-right">PRECIO VENTA</th>
              <th className="p-4 font-normal text-right">STOCK</th>
              <th className="p-4 font-normal text-center">ESTADO</th>
              <th className="p-4 font-normal text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filteredProducts.map(product => {
              const isLowStock = product.stock <= product.minStock;
              const isOutOfStock = product.stock === 0;

              return (
                <tr key={product.id} className="hover:bg-zinc-900/30 transition-colors group">
                  <td className="p-4 text-sm font-mono text-zinc-500">{product.barcode}</td>
                  <td className="p-4 text-sm font-medium text-zinc-200">{product.name}</td>
                  <td className="p-4 text-xs font-mono text-zinc-400">{product.category}</td>
                  <td className="p-4 text-sm numeric-mono text-zinc-400 text-right">${product.costPrice.toFixed(2)}</td>
                  <td className="p-4 text-sm numeric-mono text-emerald-400 text-right font-bold">${product.salePrice.toFixed(2)}</td>
                  <td className="p-4 text-sm numeric-mono text-zinc-300 text-right">
                    <span className={isOutOfStock ? 'text-rose-500 font-bold' : isLowStock ? 'text-amber-500' : ''}>
                      {product.stock}
                    </span>
                    <span className="text-zinc-600 ml-1 text-xs">/ {product.minStock} min</span>
                  </td>
                  <td className="p-4 text-center">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center px-2 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-mono tracking-widest uppercase gap-1">
                        <AlertTriangle size={12} /> Agotado
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-mono tracking-widest uppercase gap-1">
                        <AlertTriangle size={12} /> Crítico
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-mono tracking-widest uppercase">
                        Óptimo
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setAdjustingProduct(product)}
                        title="Ajustar Stock"
                        className="text-zinc-500 hover:text-cyan-400 p-1.5 transition-colors font-mono text-xs flex items-center gap-1"
                      >
                        <ArrowDownUp size={14} />
                      </button>
                      <button 
                        onClick={() => handleEdit(product)}
                        title="Editar Producto"
                        className="text-zinc-500 hover:text-emerald-400 p-1.5 transition-colors font-mono text-xs flex items-center gap-1"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`¿Eliminar definitivamente el producto ${product.name}?`)) {
                            deleteProduct(product.id);
                          }
                        }}
                        title="Eliminar Producto"
                        className="text-zinc-500 hover:text-rose-500 p-1.5 transition-colors font-mono text-xs flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-zinc-600 font-mono text-sm border-t border-zinc-800">
            NO SE ENCONTRARON REGISTROS
          </div>
        )}
      </div>

      {isProductModalOpen && (
        <ProductModal 
          product={editingProduct}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }} 
        />
      )}

      {adjustingProduct && (
        <AdjustStockModal 
          product={adjustingProduct} 
          onClose={() => setAdjustingProduct(null)} 
        />
      )}
    </div>
  );
}
