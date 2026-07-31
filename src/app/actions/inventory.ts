'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import { verifySession } from '@/app/actions/auth';

export type Product = {
  id: string;
  barcode: string;
  name: string;
  category: string;
  unit: string;
  cost_price: number;
  sale_price: number;
  stock: number;
  min_stock: number;
  status: string;
  image: string | null;
};

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await query('SELECT * FROM products ORDER BY name ASC');
    return res.rows.map(row => ({
      ...row,
      cost_price: Number(row.cost_price),
      sale_price: Number(row.sale_price)
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function checkoutCart(items: { id: string, name: string, price: number, qty: number }[]) {
  try {
    const session = await verifySession(['admin', 'seller']);
    for (const item of items) {
      await query(
        `UPDATE products SET stock = stock - $1, status = CASE WHEN stock - $1 <= 0 THEN 'out_of_stock' WHEN stock - $1 <= min_stock THEN 'low_stock' ELSE 'in_stock' END WHERE id = $2 AND stock >= $1`,
        [item.qty, item.id]
      );
      
      // Log movement (simplified)
      await query(
        `INSERT INTO inventory_movements (id, product_id, product_name, barcode, type, quantity, previous_stock, new_stock, reason, "user")
         SELECT $1, id, name, barcode, 'sale', $2, stock + $2, stock, 'Sale POS', 'admin' FROM products WHERE id = $3`,
         [randomUUID(), item.qty, item.id]
      );
    }
    
    // Create sales record
    const total = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const saleId = randomUUID();
    await query(
      `INSERT INTO sales (id, code, items, subtotal, tax_amount, discount_amount, total_amount, payment_method, amount_paid, change_given, cashier_name, status)
       VALUES ($1, $2, $3, $4, 0, 0, $4, 'cash', $4, 0, 'admin', 'completed')`,
      [saleId, `V-${Date.now()}`, JSON.stringify(items), total]
    );

    revalidatePath('/');
    revalidatePath('/almacen');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Checkout failed:', error);
    return { success: false, error: 'Checkout failed' };
  }
}

export async function updateProductStock(id: string, newStock: number) {
  try {
    await verifySession(['admin', 'seller']);
    await query(
      `UPDATE products SET stock = $1, status = CASE WHEN $1 <= 0 THEN 'out_of_stock' WHEN $1 <= min_stock THEN 'low_stock' ELSE 'in_stock' END WHERE id = $2`,
      [newStock, id]
    );
    revalidatePath('/seller');
    return { success: true };
  } catch (error) {
    console.error('Error updating stock:', error);
    return { success: false, error: 'Update failed' };
  }
}

export async function createProduct(data: Omit<Product, 'id' | 'status'>) {
  try {
    await verifySession(['admin']);
    const id = randomUUID();
    const status = data.stock <= 0 ? 'out_of_stock' : data.stock <= data.min_stock ? 'low_stock' : 'in_stock';
    
    await query(
      `INSERT INTO products (id, barcode, name, category, unit, cost_price, sale_price, stock, min_stock, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, data.barcode, data.name, data.category, data.unit, data.cost_price, data.sale_price, data.stock, data.min_stock, status]
    );
    revalidatePath('/seller');
    return { success: true };
  } catch (error) {
    console.error('Error creating product:', error);
    return { success: false, error: 'Create failed' };
  }
}

export async function deleteProduct(id: string) {
  try {
    await verifySession(['admin']);
    await query('DELETE FROM products WHERE id = $1', [id]);
    revalidatePath('/seller');
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: 'Delete failed' };
  }
}
