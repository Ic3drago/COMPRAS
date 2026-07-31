import { Product, SaleTransaction, InventoryMovement, CashShift } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    barcode: 'GPU-RTX-4090',
    name: 'NVIDIA GeForce RTX 4090 24GB',
    category: 'Tarjetas Gráficas',
    unit: 'Unidad',
    costPrice: 1500.00,
    salePrice: 1850.00,
    stock: 5,
    minStock: 2,
    status: 'in_stock',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80',
    updatedAt: new Date().toISOString()
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    barcode: 'CPU-AMD-7800X3D',
    name: 'AMD Ryzen 7 7800X3D',
    category: 'Procesadores',
    unit: 'Unidad',
    costPrice: 350.00,
    salePrice: 420.00,
    stock: 12,
    minStock: 5,
    status: 'in_stock',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80',
    updatedAt: new Date().toISOString()
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    barcode: 'RAM-COR-32GB-6000',
    name: 'Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz',
    category: 'Memoria RAM',
    unit: 'Kit',
    costPrice: 110.00,
    salePrice: 145.00,
    stock: 24,
    minStock: 10,
    status: 'in_stock',
    image: 'https://images.unsplash.com/photo-1562976540-1502f7592208?w=800&q=80',
    updatedAt: new Date().toISOString()
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    barcode: 'MB-ASUS-B650',
    name: 'ASUS ROG Strix B650-A Gaming WiFi',
    category: 'Placas Base',
    unit: 'Unidad',
    costPrice: 220.00,
    salePrice: 280.00,
    stock: 8,
    minStock: 4,
    status: 'in_stock',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    updatedAt: new Date().toISOString()
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    barcode: 'SSD-WD-2TB-SN850X',
    name: 'WD Black SN850X 2TB NVMe PCIe Gen4',
    category: 'Almacenamiento',
    unit: 'Unidad',
    costPrice: 130.00,
    salePrice: 169.99,
    stock: 18,
    minStock: 8,
    status: 'in_stock',
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80',
    updatedAt: new Date().toISOString()
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    barcode: 'PSU-SEA-850W',
    name: 'Seasonic Focus GX-850, 850W 80+ Gold Fully Modular',
    category: 'Fuentes de Poder',
    unit: 'Unidad',
    costPrice: 105.00,
    salePrice: 140.00,
    stock: 15,
    minStock: 5,
    status: 'in_stock',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80',
    updatedAt: new Date().toISOString()
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    barcode: 'CASE-NZXT-H5',
    name: 'NZXT H5 Flow RGB Compact ATX Mid-Tower',
    category: 'Gabinetes',
    unit: 'Unidad',
    costPrice: 85.00,
    salePrice: 119.99,
    stock: 6,
    minStock: 3,
    status: 'in_stock',
    image: 'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=800&q=80',
    updatedAt: new Date().toISOString()
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    barcode: 'COOL-NZXT-KRAKEN',
    name: 'NZXT Kraken 240 RGB Liquid Cooler',
    category: 'Refrigeración',
    unit: 'Unidad',
    costPrice: 120.00,
    salePrice: 155.00,
    stock: 10,
    minStock: 4,
    status: 'in_stock',
    image: 'https://images.unsplash.com/photo-1624701928517-44c8ac49d93c?w=800&q=80',
    updatedAt: new Date().toISOString()
  },
  {
    id: '99999999-9999-9999-9999-999999999999',
    barcode: 'MON-LG-27GP850',
    name: 'LG 27GP850-B 27" Ultragear QHD Nano IPS 165Hz',
    category: 'Monitores',
    unit: 'Unidad',
    costPrice: 290.00,
    salePrice: 380.00,
    stock: 7,
    minStock: 2,
    status: 'in_stock',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    barcode: 'KEY-LOG-G915',
    name: 'Logitech G915 TKL Tenkeyless Lightspeed Wireless',
    category: 'Periféricos',
    unit: 'Unidad',
    costPrice: 160.00,
    salePrice: 220.00,
    stock: 14,
    minStock: 5,
    status: 'in_stock',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_SHIFT: CashShift = {
  id: 'shift-104',
  cashierName: 'Admin Principal',
  openedAt: new Date().toISOString(),
  initialCash: 500.00,
  totalSalesCash: 0,
  totalSalesCard: 0,
  totalSalesQR: 0,
  totalSalesAmount: 0,
  transactionsCount: 0,
  isOpen: true
};

export const INITIAL_TRANSACTIONS: SaleTransaction[] = [];
export const INITIAL_MOVEMENTS: InventoryMovement[] = [];
