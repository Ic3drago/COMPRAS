'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Product, ProductCategory } from '@/lib/types';
import { X, Save, Barcode, DollarSign, Package } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'Abarrotes',
  'Bebidas',
  'Lácteos y Huevos',
  'Snacks y Galletas',
  'Panadería',
  'Limpieza',
  'Cuidado Personal'
];

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addProduct, updateProduct } = useStore();

  const [name, setName] = useState(product?.name || '');
  const [barcode, setBarcode] = useState(product?.barcode || '');
  const [category, setCategory] = useState<ProductCategory>(product?.category || 'Abarrotes');
  const [unit, setUnit] = useState(product?.unit || 'Unidad');
  const [costPrice, setCostPrice] = useState(product?.costPrice.toString() || '');
  const [salePrice, setSalePrice] = useState(product?.salePrice.toString() || '');
  const [stock, setStock] = useState(product?.stock.toString() || '0');
  const [minStock, setMinStock] = useState(product?.minStock.toString() || '10');

  const costNum = parseFloat(costPrice) || 0;
  const saleNum = parseFloat(salePrice) || 0;
  const marginPercent = saleNum > 0 ? ((saleNum - costNum) / saleNum) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !barcode.trim()) return;

    if (product) {
      updateProduct(product.id, {
        name,
        barcode,
        category,
        unit,
        costPrice: costNum,
        salePrice: saleNum,
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 5
      });
    } else {
      addProduct({
        name,
        barcode,
        category,
        unit,
        costPrice: costNum,
        salePrice: saleNum,
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 5
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-7 max-w-lg w-full shadow-2xl space-y-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-100">
              {product ? 'Editar Producto' : 'Registrar Nuevo Producto'}
            </h3>
            <p className="text-xs text-zinc-400">Complete la ficha técnica del producto</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 p-2 rounded-xl hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Nombre Comercial</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Leche Entera 1L"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Código de Barras</label>
              <input
                type="text"
                required
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="750100..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-medium focus:outline-none focus:border-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Precio Costo ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Precio Venta ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-xs font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {!product && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Stock Inicial</label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Stock Mínimo (Alerta)</label>
              <input
                type="number"
                min="1"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-400 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Margen Calculado */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Margen de Ganancia Estimado:</span>
            <span className="font-extrabold font-mono text-emerald-400 text-sm">
              +{marginPercent.toFixed(1)}%
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/40"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Producto</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};
