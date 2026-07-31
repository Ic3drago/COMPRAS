import { NextResponse } from 'next/server';
import { pool, ensureSchema } from '@/lib/postgres';

export async function GET() {
  await ensureSchema();
  const result = await pool.query('SELECT * FROM inventory_movements ORDER BY timestamp DESC');
  return NextResponse.json(result.rows);
}
