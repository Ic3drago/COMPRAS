'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  CartItem, 
  SaleTransaction, 
  InventoryMovement, 
  CashShift, 
  ProductCategory, 
  ToastNotification,
  PaymentMethod
} from './types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_MOVEMENTS, 
  INITIAL_SHIFT 
} from './mockData';

interface StoreContextType {
  // Navigation & View
  activeTab: 'pos' | 'inventario' | 'metricas';
  setActiveTab: (tab: 'pos' | 'inventario' | 'metricas') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: ProductCategory;
  setSelectedCategory: (category: ProductCategory) => void;

  // Products & Inventory
  products: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'status' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  adjustProductStock: (id: string, delta: number, reason: string, type: 'entrada' | 'salida' | 'ajuste') => Promise<void>;
  lowStockCount: number;

  // Cart (POS)
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  updateCartDiscount: (productId: string, discountPercentage: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTaxAmount: number;
  cartDiscountAmount: number;
  cartTotal: number;
  scanBarcode: (barcode: string) => boolean;

  // Sales & Shift
  sales: SaleTransaction[];
  shift: CashShift;
  processSale: (paymentMethod: PaymentMethod, amountPaid: number) => Promise<SaleTransaction | null>;
  cancelSale: (saleId: string) => Promise<void>;

  // Inventory Movements Log
  movements: InventoryMovement[];

  // Toasts
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'pos' | 'inventario' | 'metricas'>('pos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('Todos');

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<SaleTransaction[]>(INITIAL_TRANSACTIONS);
  const [movements, setMovements] = useState<InventoryMovement[]>(INITIAL_MOVEMENTS);
  const [shift, setShift] = useState<CashShift>(INITIAL_SHIFT);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchJson = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, { ...options, cache: 'no-store' });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error || 'Error al consultar la API');
    }
    return payload;
  };

  useEffect(() => {
    const loadRemoteData = async () => {
      try {
        const [productsData, salesData, movementsData, shiftData] = await Promise.all([
          fetchJson('/api/products'),
          fetchJson('/api/sales'),
          fetchJson('/api/movements'),
          fetchJson('/api/shift')
        ]);

        setProducts(productsData ?? INITIAL_PRODUCTS);
        setSales(salesData ?? INITIAL_TRANSACTIONS);
        setMovements(movementsData ?? INITIAL_MOVEMENTS);
        setShift(shiftData ?? INITIAL_SHIFT);
      } catch (error) {
        console.error('Error cargando datos remotos', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadRemoteData();
  }, []);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Helper to recompute product status
  const calculateStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return 'out_of_stock';
    if (stock <= minStock) return 'low_stock';
    return 'in_stock';
  };

  // Low stock counter
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  // Cart Computations
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const cartDiscountAmount = cart.reduce((acc, item) => {
    const itemSubtotal = item.unitPrice * item.quantity;
    return acc + (itemSubtotal * (item.discountPercentage / 100));
  }, 0);
  const taxableBase = cartSubtotal - cartDiscountAmount;
  const cartTaxAmount = taxableBase * 0.16; // 16% IVA
  const cartTotal = taxableBase + cartTaxAmount;

  // Cart Actions
  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      showToast(`El producto ${product.name} está agotado en inventario.`, 'error');
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          showToast(`No hay suficiente stock. Disponibles: ${product.stock}`, 'warning');
          return prevCart;
        }
        showToast(`Cantidad actualizada: ${product.name} (${newQty})`, 'info');
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQty, total: (item.unitPrice * newQty) * (1 - item.discountPercentage / 100) }
            : item
        );
      } else {
        if (quantity > product.stock) {
          showToast(`No hay suficiente stock. Disponibles: ${product.stock}`, 'warning');
          return prevCart;
        }
        showToast(`Añadido a caja: ${product.name}`, 'success');
        return [...prevCart, {
          product,
          quantity,
          discountPercentage: 0,
          unitPrice: product.salePrice,
          total: product.salePrice * quantity
        }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showToast('Producto eliminado de la orden', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        if (quantity > item.product.stock) {
          showToast(`Límite de stock alcanzado (${item.product.stock})`, 'warning');
          return item;
        }
        return {
          ...item,
          quantity,
          total: (item.unitPrice * quantity) * (1 - item.discountPercentage / 100)
        };
      }
      return item;
    }));
  };

  const updateCartDiscount = (productId: string, discountPercentage: number) => {
    const validDiscount = Math.min(Math.max(discountPercentage, 0), 100);
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const subtotal = item.unitPrice * item.quantity;
        return {
          ...item,
          discountPercentage: validDiscount,
          total: subtotal * (1 - validDiscount / 100)
        };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const scanBarcode = (barcode: string): boolean => {
    const foundProduct = products.find(p => p.barcode.trim() === barcode.trim());
    if (foundProduct) {
      addToCart(foundProduct, 1);
      return true;
    }
    showToast(`Código de barras ${barcode} no encontrado.`, 'error');
    return false;
  };

  // Inventory Actions
  const adjustProductStock = async (id: string, delta: number, reason: string, type: 'entrada' | 'salida' | 'ajuste') => {
    try {
      const payload = await fetchJson(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockChange: delta,
          reason,
          type
        })
      });

      setProducts(prev => prev.map(p => p.id === id ? payload : p));

      const movementsData = await fetchJson('/api/movements');
      setMovements(movementsData ?? movements);
      showToast('Inventario actualizado de producto.', 'success');
    } catch (error) {
      console.error(error);
      showToast('No se pudo actualizar el inventario.', 'error');
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'status' | 'updatedAt'>) => {
    try {
      const payload = await fetchJson('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      setProducts(prev => [payload, ...prev]);
      showToast(`Producto ${payload.name} creado correctamente.`, 'success');
    } catch (error) {
      console.error(error);
      showToast('No se pudo crear el producto.', 'error');
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const payload = await fetchJson(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      setProducts(prev => prev.map(p => p.id === id ? payload : p));
      showToast('Datos del producto actualizados', 'success');
    } catch (error) {
      console.error(error);
      showToast('No se pudo actualizar el producto.', 'error');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await fetchJson(`/api/products/${id}`, { method: 'DELETE' });
      const prod = products.find(p => p.id === id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setCart(prev => prev.filter(item => item.product.id !== id));
      if (prod) {
        showToast(`Producto ${prod.name} eliminado de la base de datos`, 'warning');
      }
    } catch (error) {
      console.error(error);
      showToast('No se pudo eliminar el producto.', 'error');
    }
  };

  const processSale = async (paymentMethod: PaymentMethod, amountPaid: number): Promise<SaleTransaction | null> => {
    if (cart.length === 0) {
      showToast('El carrito está vacío.', 'warning');
      return null;
    }

    if (paymentMethod === 'cash' && amountPaid < cartTotal) {
      showToast('El monto en efectivo es inferior al total.', 'error');
      return null;
    }

    try {
      const payload = await fetchJson('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          amountPaid,
          items: cart,
          cashierName: shift.cashierName,
          subtotal: cartSubtotal,
          taxAmount: cartTaxAmount,
          discountAmount: cartDiscountAmount,
          totalAmount: cartTotal
        })
      });

      const sale: SaleTransaction = payload.sale;
      setSales(prev => [sale, ...prev]);
      setProducts(prev => prev.map(prod => {
        const updated = payload.products.find((p: Product) => p.id === prod.id);
        return updated ?? prod;
      }));
      setMovements(await fetchJson('/api/movements'));
      setShift(await fetchJson('/api/shift'));
      clearCart();
      showToast(`Venta ${sale.code} procesada exitosamente.`, 'success');
      return sale;
    } catch (error) {
      console.error(error);
      showToast('No se pudo procesar el pago.', 'error');
      return null;
    }
  };

  const cancelSale = async (saleId: string) => {
    try {
      await fetchJson('/api/sales', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId })
      });

      setSales(prev => prev.map(s => s.id === saleId ? { ...s, status: 'cancelled' } : s));
      setProducts(await fetchJson('/api/products'));
      setMovements(await fetchJson('/api/movements'));
      setShift(await fetchJson('/api/shift'));
      showToast(`Venta anulada y stock devuelto.`, 'warning');
    } catch (error) {
      console.error(error);
      showToast('No se pudo anular la venta.', 'error');
    }
  };

  return (
    <StoreContext.Provider value={{
      activeTab,
      setActiveTab,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustProductStock,
      lowStockCount,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      updateCartDiscount,
      clearCart,
      cartSubtotal,
      cartTaxAmount,
      cartDiscountAmount,
      cartTotal,
      scanBarcode,
      sales,
      shift,
      processSale,
      cancelSale,
      movements,
      toasts,
      showToast,
      removeToast
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore debe ser usado dentro de un StoreProvider');
  }
  return context;
};
