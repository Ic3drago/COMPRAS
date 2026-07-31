import { NextResponse } from 'next/server';
import { pool, ensureSchema, calculateStatus, mapProductRows } from '@/lib/postgres';

export async function GET() {
  try {
    await ensureSchema();
    const result = await pool.query(
      `SELECT id, barcode, name, category, unit, cost_price, sale_price, stock, min_stock, status, image, updated_at FROM products ORDER BY updated_at DESC`
    );
    return NextResponse.json(mapProductRows(result.rows));
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error?.message || 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await ensureSchema();
  const body = await req.json();
  const {
    barcode,
    name,
    category,
    unit,
    costPrice,
    salePrice,
    stock,
    minStock,
    image
  } = body;

  if (!barcode || !name || !category || !unit || costPrice == null || salePrice == null || stock == null || minStock == null) {
    return NextResponse.json({ error: 'Faltan campos obligatorios para crear el producto' }, { status: 400 });
  }

  const status = calculateStatus(Number(stock), Number(minStock));
  const id = crypto.randomUUID();
  const updatedAt = new Date().toISOString();

  const created = await pool.query(
    `INSERT INTO products (
      id, barcode, name, category, unit, cost_price,
      sale_price, stock, min_stock, status, image, updated_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING id, barcode, name, category, unit, cost_price, sale_price, stock, min_stock, status, image, updated_at`,
    [
      id,
      barcode,
      name,
      category,
      unit,
      costPrice,
      salePrice,
      stock,
      minStock,
      status,
      image || null,
      updatedAt
    ]
  );

  return NextResponse.json(mapProductRows(created.rows)[0]);
}
