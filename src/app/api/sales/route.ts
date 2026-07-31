import { NextResponse } from 'next/server';
import { pool, ensureSchema, calculateStatus, mapProductRows } from '@/lib/postgres';

export async function GET() {
  try {
    await ensureSchema();
    const result = await pool.query('SELECT * FROM sales ORDER BY timestamp DESC');
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: error?.message || 'Error al obtener ventas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureSchema();
  const body = await req.json();
  const { paymentMethod, amountPaid, items, cashierName } = body;

  if (!paymentMethod || !Array.isArray(items) || items.length === 0 || !cashierName) {
    return NextResponse.json({ error: 'Datos de venta incompletos' }, { status: 400 });
  }

  const subtotal = Number(body.subtotal ?? items.reduce((sum: number, item: any) => sum + (Number(item.unitPrice) * Number(item.quantity)), 0));
  const discountAmount = Number(body.discountAmount ?? items.reduce((sum: number, item: any) => sum + (Number(item.unitPrice) * Number(item.quantity) * (Number(item.discountPercentage) / 100)), 0));
  const taxAmount = Number(body.taxAmount ?? ((subtotal - discountAmount) * 0.16));
  const totalAmount = Number(body.totalAmount ?? subtotal - discountAmount + taxAmount);

  if (paymentMethod === 'cash' && Number(amountPaid) < totalAmount) {
    return NextResponse.json({ error: 'El monto pagado es insuficiente' }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const code = `VEN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const changeGiven = paymentMethod === 'cash' ? Math.max(0, Number(amountPaid) - totalAmount) : 0;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updatedProducts = [];
    for (const item of items) {
      const productRes = await client.query(
        'SELECT id, barcode, name, category, unit, cost_price, sale_price, stock, min_stock, status, image, updated_at FROM products WHERE id = $1 FOR UPDATE',
        [item.product.id]
      );
      if (!productRes.rowCount) {
        throw new Error(`Producto con id ${item.product.id} no encontrado`);
      }

      const product = productRes.rows[0];
      const newStock = Math.max(0, Number(product.stock) - Number(item.quantity));
      const status = calculateStatus(newStock, Number(product.min_stock));

      await client.query(
        `UPDATE products SET stock = $1, status = $2, updated_at = now() WHERE id = $3`,
        [newStock, status, item.product.id]
      );

      await client.query(
        `INSERT INTO inventory_movements (
          id, product_id, product_name, barcode, type,
          quantity, previous_stock, new_stock, reason,
          timestamp, "user"
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          crypto.randomUUID(),
          item.product.id,
          product.name,
          product.barcode,
          'salida',
          Number(item.quantity),
          Number(product.stock),
          newStock,
          `Venta POS ${code}`,
          new Date().toISOString(),
          cashierName
        ]
      );

      updatedProducts.push({
        ...product,
        stock: newStock,
        status,
        updatedAt: new Date().toISOString()
      });
    }

    await client.query(
      `INSERT INTO sales (
        id, code, timestamp, items, subtotal,
        tax_amount, discount_amount, total_amount,
        payment_method, amount_paid, change_given,
        cashier_name, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        id,
        code,
        new Date().toISOString(),
        JSON.stringify(items),
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        paymentMethod,
        Number(amountPaid),
        changeGiven,
        cashierName,
        'completed'
      ]
    );

    await client.query(
      `UPDATE shift SET
        total_sales_cash = total_sales_cash + $1,
        total_sales_card = total_sales_card + $2,
        total_sales_qr = total_sales_qr + $3,
        total_sales_amount = total_sales_amount + $4,
        transactions_count = transactions_count + 1
      WHERE id = (SELECT id FROM shift LIMIT 1)`,
      [
        paymentMethod === 'cash' ? totalAmount : 0,
        paymentMethod === 'card' ? totalAmount : 0,
        paymentMethod === 'qr' ? totalAmount : 0,
        totalAmount
      ]
    );

    await client.query('COMMIT');

    return NextResponse.json({
      sale: {
        id,
        code,
        timestamp: new Date().toISOString(),
        items,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        paymentMethod,
        amountPaid: Number(amountPaid),
        changeGiven,
        cashierName,
        status: 'completed'
      },
      products: updatedProducts
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: String(error) }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PATCH(req: Request) {
  await ensureSchema();
  const body = await req.json();
  const { saleId } = body;

  if (!saleId) {
    return NextResponse.json({ error: 'Falta el id de la venta' }, { status: 400 });
  }

  const saleResult = await pool.query('SELECT * FROM sales WHERE id = $1', [saleId]);
  if (!saleResult.rowCount) {
    return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 });
  }

  const sale = saleResult.rows[0];
  if (sale.status === 'cancelled') {
    return NextResponse.json({ error: 'Venta ya cancelada' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const items = sale.items as any[];
    for (const item of items) {
      const productResult = await client.query('SELECT stock, min_stock FROM products WHERE id = $1', [item.product.id]);
      if (!productResult.rowCount) continue;
      const product = productResult.rows[0];
      const newStock = Number(product.stock) + Number(item.quantity);
      const status = calculateStatus(newStock, Number(product.min_stock));

      await client.query('UPDATE products SET stock = $1, status = $2, updated_at = now() WHERE id = $3', [newStock, status, item.product.id]);
      await client.query(
        `INSERT INTO inventory_movements (
          id, product_id, product_name, barcode, type,
          quantity, previous_stock, new_stock, reason,
          timestamp, "user"
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          crypto.randomUUID(),
          item.product.id,
          item.product.name,
          item.product.barcode,
          'entrada',
          Number(item.quantity),
          Number(product.stock),
          newStock,
          `Anulación venta ${sale.code}`,
          new Date().toISOString(),
          sale.cashier_name
        ]
      );
    }

    await client.query('UPDATE sales SET status = $1 WHERE id = $2', ['cancelled', saleId]);
    await client.query('COMMIT');

    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: String(error) }, { status: 500 });
  } finally {
    client.release();
  }
}
