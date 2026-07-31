export type ProductCategory = string;

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: ProductCategory;
  unit: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  status: StockStatus;
  image?: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountPercentage: number;
  unitPrice: number;
  total: number;
}

export type PaymentMethod = 'cash' | 'card' | 'qr' | 'credit';

export interface SaleTransaction {
  id: string;
  code: string;
  timestamp: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeGiven: number;
  cashierName: string;
  status: 'completed' | 'cancelled';
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  type: 'entrada' | 'salida' | 'ajuste';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  timestamp: string;
  user: string;
}

export interface CashShift {
  id: string;
  cashierName: string;
  openedAt: string;
  initialCash: number;
  totalSalesCash: number;
  totalSalesCard: number;
  totalSalesQR: number;
  totalSalesAmount: number;
  transactionsCount: number;
  isOpen: boolean;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}
