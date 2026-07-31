import { NextResponse } from 'next/server';
import { pool, ensureSchema, calculateStatus, mapProductRows } from '@/lib/postgres';

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  await ensureSchema();
  const { id: productId } = await context.params;
  const body = await req.json();

  const productResult = await pool.query(
    'SELECT id, barcode, name, category, unit, cost_price, sale_price, stock, min_stock, status, image, updated_at FROM products WHERE id = $1',
    [productId]
  );

  if (!productResult.rowCount) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  }

  const existing = productResult.rows[0];
  const isStockAdjustment = body.stockChange != null && body.type && body.reason;

  if (isStockAdjustment) {
    const stockChange = Number(body.stockChange);
    const previousStock = Number(existing.stock);
    const newStock = Math.max(0, previousStock + stockChange);
    const status = calculateStatus(newStock, Number(existing.min_stock));

    await pool.query(
      `UPDATE products SET stock = $1, status = $2, updated_at = now() WHERE id = $3`,
      [newStock, status, productId]
    );

    await pool.query(
      `INSERT INTO inventory_movements (
        id, product_id, product_name, barcode, type,
        quantity, previous_stock, new_stock, reason,
        timestamp, "user"
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        crypto.randomUUID(),
        productId,
        existing.name,
        existing.barcode,
        body.type,
        Math.abs(stockChange),
        previousStock,
        newStock,
        body.reason,
        new Date().toISOString(),
        'Sistema'
      ]
    );

    return NextResponse.json(mapProductRows([{ ...existing, stock: newStock, status, updated_at: new Date().toISOString() }])[0]);
  }

  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  const allowedFields = {
    barcode: body.barcode,
    name: body.name,
    category: body.category,
    unit: body.unit,
    cost_price: body.costPrice,
    sale_price: body.salePrice,
    stock: body.stock,
    min_stock: body.minStock,
    image: body.image
  };

  for (const [field, value] of Object.entries(allowedFields)) {
    if (value != null) {
      updates.push(`${field} = $${index}`);
      values.push(value);
      index += 1;
    }
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No hay actualizaciones para aplicar' }, { status: 400 });
  }

  const stockValue = body.stock != null ? Number(body.stock) : Number(existing.stock);
  const minStockValue = body.minStock != null ? Number(body.minStock) : Number(existing.min_stock);
  const status = calculateStatus(stockValue, minStockValue);

  updates.push(`status = $${index}`);
  values.push(status);
  index += 1;
  updates.push(`updated_at = now()`);

  values.push(productId);

  await pool.query(
    `UPDATE products SET ${updates.join(', ')} WHERE id = $${index}`,
    values
  );

  const updatedResult = await pool.query(
    'SELECT id, barcode, name, category, unit, cost_price, sale_price, stock, min_stock, status, image, updated_at FROM products WHERE id = $1',
    [productId]
  );

  return NextResponse.json(mapProductRows(updatedResult.rows)[0]);
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  await ensureSchema();
  const { id } = await context.params;
  await pool.query('DELETE FROM products WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
}
