import { NextResponse } from 'next/server';
import { pool, ensureSchema } from '@/lib/postgres';

export async function GET() {
  await ensureSchema();
  const result = await pool.query('SELECT * FROM shift LIMIT 1');
  return NextResponse.json(result.rows[0] ?? null);
}
