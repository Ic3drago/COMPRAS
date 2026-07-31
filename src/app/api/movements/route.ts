import { NextResponse } from 'next/server';
import { pool, ensureSchema } from '@/lib/postgres';

export async function GET() {
  try {
    await ensureSchema();
    const result = await pool.query('SELECT * FROM inventory_movements ORDER BY timestamp DESC');
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching movements:', error);
    return NextResponse.json({ error: error?.message || 'Error al obtener movimientos' }, { status: 500 });
  }
}
