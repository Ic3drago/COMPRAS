import { NextResponse } from 'next/server';
import { pool, ensureSchema } from '@/lib/postgres';

export async function GET() {
  try {
    await ensureSchema();
    const result = await pool.query('SELECT * FROM shift LIMIT 1');
    return NextResponse.json(result.rows[0] ?? null);
  } catch (error: any) {
    console.error('Error fetching shift:', error);
    return NextResponse.json({ error: error?.message || 'Error al obtener turno' }, { status: 500 });
  }
}
