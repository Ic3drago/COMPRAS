'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { verifySession } from '@/app/actions/auth';

export async function getSales() {
  try {
    const res = await query('SELECT * FROM sales ORDER BY timestamp DESC');
    return res.rows.map(row => ({
      ...row,
      subtotal: Number(row.subtotal),
      tax_amount: Number(row.tax_amount),
      discount_amount: Number(row.discount_amount),
      total_amount: Number(row.total_amount),
      amount_paid: Number(row.amount_paid),
      change_given: Number(row.change_given),
      timestamp: row.timestamp.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching sales:', error);
    return [];
  }
}

export async function deleteSale(id: string) {
  try {
    await verifySession(['admin']);
    // Revert inventory from this sale
    const saleRes = await query('SELECT items FROM sales WHERE id = $1', [id]);
    if (saleRes.rows.length > 0) {
      const items = saleRes.rows[0].items;
      for (const item of items) {
        await query(
          `UPDATE products SET stock = stock + $1, status = CASE WHEN stock + $1 <= 0 THEN 'out_of_stock' WHEN stock + $1 <= min_stock THEN 'low_stock' ELSE 'in_stock' END WHERE id = $2`,
          [item.qty, item.id]
        );
      }
    }

    await query('DELETE FROM sales WHERE id = $1', [id]);
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error deleting sale:', error);
    return { success: false, error: 'Failed to delete sale' };
  }
}

export async function createSale(data: any) {
  try {
    await verifySession(['admin', 'seller']);
    const id = crypto.randomUUID();
    const code = `VEN-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const timestamp = new Date().toISOString();
    
    // Process stock decrements
    for (const item of data.items) {
      await query(
        `UPDATE products SET stock = stock - $1, status = CASE WHEN stock - $1 <= 0 THEN 'out_of_stock' WHEN stock - $1 <= min_stock THEN 'low_stock' ELSE 'in_stock' END WHERE id = $2`,
        [item.quantity, item.product.id]
      );
    }

    await query(
      `INSERT INTO sales (
        id, code, timestamp, items, subtotal,
        tax_amount, discount_amount, total_amount,
        payment_method, amount_paid, change_given,
        cashier_name, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        id, code, timestamp, JSON.stringify(data.items), data.subtotal,
        data.taxAmount, data.discountAmount, data.totalAmount,
        data.paymentMethod, data.amountPaid, data.changeGiven,
        data.cashierName, 'completed'
      ]
    );

    revalidatePath('/admin');
    revalidatePath('/seller');
    return { success: true };
  } catch (error) {
    console.error('Error creating sale:', error);
    return { success: false, error: 'Failed to create sale' };
  }
}
