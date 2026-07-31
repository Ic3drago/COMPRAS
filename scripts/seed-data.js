module.exports = {
  products: [
    {
      id: 'b1cb95a0-87a8-4121-aec4-3cf50d29e5f0',
      barcode: '7501055300078',
      name: 'Leche Entera Alpina 1L',
      category: 'Lácteos y Huevos',
      unit: 'Litro',
      costPrice: 1.1,
      salePrice: 1.6,
      stock: 42,
      minStock: 15,
      updatedAt: '2026-07-29T10:00:00Z'
    },
    {
      id: '195c04b6-8c5b-4133-8b68-54cdf6349569',
      barcode: '7702001041400',
      name: 'Arroz Extra Superior 1kg',
      category: 'Abarrotes',
      unit: 'Kg',
      costPrice: 0.85,
      salePrice: 1.25,
      stock: 8,
      minStock: 20,
      updatedAt: '2026-07-29T11:30:00Z'
    },
    {
      id: '4cda5ec9-08a7-4fed-9f35-e11a7ecc118d',
      barcode: '7702001002012',
      name: 'Aceite Vegetal Girasol 900ml',
      category: 'Abarrotes',
      unit: 'Botella',
      costPrice: 2.1,
      salePrice: 2.99,
      stock: 24,
      minStock: 10,
      updatedAt: '2026-07-28T14:15:00Z'
    },
    {
      id: 'e0ea2cd1-dbd2-4b0f-92cd-1c9aa35fc21b',
      barcode: '7501000111204',
      name: 'Coca-Cola Zero 600ml',
      category: 'Bebidas',
      unit: 'Unidad',
      costPrice: 0.65,
      salePrice: 1.1,
      stock: 65,
      minStock: 24,
      updatedAt: '2026-07-29T09:00:00Z'
    },
    {
      id: 'a5dd4f8c-f16f-4b35-92f9-cfe0d3eeb987',
      barcode: '7702001055001',
      name: 'Pan Molde Integral 500g',
      category: 'Panadería',
      unit: 'Bolsa',
      costPrice: 1.4,
      salePrice: 2.2,
      stock: 4,
      minStock: 10,
      updatedAt: '2026-07-29T07:45:00Z'
    },
    {
      id: 'bb73c3aa-13dd-4e2d-9745-62e451783f2e',
      barcode: '7501000155601',
      name: 'Agua Mineral Sin Gas 1.5L',
      category: 'Bebidas',
      unit: 'Botella',
      costPrice: 0.4,
      salePrice: 0.8,
      stock: 90,
      minStock: 30,
      updatedAt: '2026-07-27T16:00:00Z'
    }
  ],
  shift: {
    id: 'shift-104',
    cashierName: 'Carlos Mendoza',
    openedAt: '2026-07-30T07:00:00Z',
    initialCash: 150.0,
    totalSalesCash: 342.5,
    totalSalesCard: 189.2,
    totalSalesQR: 95.8,
    totalSalesAmount: 627.5,
    transactionsCount: 24,
    isOpen: true
  },
  transactions: [
    {
      id: '569d5fa7-a4df-4e78-a2a9-fea1a6bc28a3',
      code: 'VEN-20260730-001',
      timestamp: '2026-07-30T08:14:22Z',
      items: [
        {
          id: 'b1cb95a0-87a8-4121-aec4-3cf50d29e5f0',
          barcode: '7501055300078',
          name: 'Leche Entera Alpina 1L',
          quantity: 2,
          discountPercentage: 0,
          unitPrice: 1.6,
          total: 3.2
        },
        {
          id: 'e0ea2cd1-dbd2-4b0f-92cd-1c9aa35fc21b',
          barcode: '7501000111204',
          name: 'Coca-Cola Zero 600ml',
          quantity: 3,
          discountPercentage: 0,
          unitPrice: 1.1,
          total: 3.3
        }
      ],
      subtotal: 5.6,
      taxAmount: 0.9,
      discountAmount: 0,
      totalAmount: 6.5,
      paymentMethod: 'cash',
      amountPaid: 10.0,
      changeGiven: 3.5,
      cashierName: 'Carlos Mendoza',
      status: 'completed'
    },
    {
      id: '30f2f5f3-1a0d-4dfd-b5d8-8b5d78fb9a9b',
      code: 'VEN-20260730-002',
      timestamp: '2026-07-30T09:02:10Z',
      items: [
        {
          id: '4cda5ec9-08a7-4fed-9f35-e11a7ecc118d',
          barcode: '7702001002012',
          name: 'Aceite Vegetal Girasol 900ml',
          quantity: 1,
          discountPercentage: 0,
          unitPrice: 2.99,
          total: 2.99
        },
        {
          id: '195c04b6-8c5b-4133-8b68-54cdf6349569',
          barcode: '7702001041400',
          name: 'Arroz Extra Superior 1kg',
          quantity: 1,
          discountPercentage: 10,
          unitPrice: 1.25,
          total: 1.125
        }
      ],
      subtotal: 4.09,
      taxAmount: 0.62,
      discountAmount: 0.13,
      totalAmount: 4.58,
      paymentMethod: 'card',
      amountPaid: 4.58,
      changeGiven: 0,
      cashierName: 'Carlos Mendoza',
      status: 'completed'
    }
  ],
  movements: [
    {
      id: 'fd1127a9-c2cc-45a0-8c11-0a7d9c8d94b4',
      productId: 'b1cb95a0-87a8-4121-aec4-3cf50d29e5f0',
      productName: 'Leche Entera Alpina 1L',
      barcode: '7501055300078',
      type: 'entrada',
      quantity: 50,
      previousStock: 0,
      newStock: 50,
      reason: 'Recepción de pedido proveedor #448',
      timestamp: '2026-07-28T09:30:00Z',
      user: 'Carlos Mendoza'
    },
    {
      id: 'd7be2d54-02d4-4f40-bb58-9e5573d9c6da',
      productId: '195c04b6-8c5b-4133-8b68-54cdf6349569',
      productName: 'Arroz Extra Superior 1kg',
      barcode: '7702001041400',
      type: 'ajuste',
      quantity: -5,
      previousStock: 13,
      newStock: 8,
      reason: 'Merma por producto dañado en traslado',
      timestamp: '2026-07-29T18:20:00Z',
      user: 'Carlos Mendoza'
    }
  ]
};
