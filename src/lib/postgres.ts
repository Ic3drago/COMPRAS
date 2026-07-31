import { Pool } from 'pg';
import { INITIAL_PRODUCTS, INITIAL_SHIFT, INITIAL_TRANSACTIONS, INITIAL_MOVEMENTS } from './mockData';
import { Product, InventoryMovement, CashShift, SaleTransaction } from './types';

declare global {
  // eslint-disable-next-line no-var
  var __pg_pool__: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required to connect to the Supabase/Postgres database');
}

export const pool = global.__pg_pool__ ?? new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});
global.__pg_pool__ = pool;

export const calculateStatus = (stock: number, minStock: number) => {
  if (stock <= 0) return 'out_of_stock';
  if (stock <= minStock) return 'low_stock';
  return 'in_stock';
};

const mapProductRow = (row: any): Product => ({
  id: row.id,
  barcode: row.barcode,
  name: row.name,
  category: row.category,
  unit: row.unit,
  costPrice: Number(row.cost_price),
  salePrice: Number(row.sale_price),
  stock: Number(row.stock),
  minStock: Number(row.min_stock),
  status: row.status,
  image: row.image ?? undefined,
  updatedAt: row.updated_at?.toISOString?.() ?? new Date().toISOString()
});

export const ensureSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id uuid PRIMARY KEY,
      barcode text UNIQUE NOT NULL,
      name text NOT NULL,
      category text NOT NULL,
      unit text NOT NULL,
      cost_price numeric NOT NULL DEFAULT 0,
      sale_price numeric NOT NULL DEFAULT 0,
      stock integer NOT NULL DEFAULT 0,
      min_stock integer NOT NULL DEFAULT 0,
      status text NOT NULL,
      image text,
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS inventory_movements (
      id uuid PRIMARY KEY,
      product_id uuid REFERENCES products(id) ON DELETE CASCADE,
      product_name text NOT NULL,
      barcode text NOT NULL,
      type text NOT NULL,
      quantity integer NOT NULL,
      previous_stock integer NOT NULL,
      new_stock integer NOT NULL,
      reason text NOT NULL,
      timestamp timestamptz NOT NULL DEFAULT now(),
      "user" text NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
      id uuid PRIMARY KEY,
      code text NOT NULL,
      timestamp timestamptz NOT NULL DEFAULT now(),
      items jsonb NOT NULL,
      subtotal numeric NOT NULL,
      tax_amount numeric NOT NULL,
      discount_amount numeric NOT NULL,
      total_amount numeric NOT NULL,
      payment_method text NOT NULL,
      amount_paid numeric NOT NULL,
      change_given numeric NOT NULL,
      cashier_name text NOT NULL,
      status text NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shift (
      id text PRIMARY KEY,
      cashier_name text NOT NULL,
      opened_at timestamptz NOT NULL,
      initial_cash numeric NOT NULL DEFAULT 0,
      total_sales_cash numeric NOT NULL DEFAULT 0,
      total_sales_card numeric NOT NULL DEFAULT 0,
      total_sales_qr numeric NOT NULL DEFAULT 0,
      total_sales_amount numeric NOT NULL DEFAULT 0,
      transactions_count integer NOT NULL DEFAULT 0,
      is_open boolean NOT NULL DEFAULT true
    );
  `);

  const productsCount = await pool.query('SELECT count(*) AS count FROM products');
  if (Number(productsCount.rows[0]?.count ?? 0) === 0) {
    const insertParts = INITIAL_PRODUCTS.map((product) => {
      const safeName = product.name.replace(/\$/g, '$$$$');
      return `(
        '${product.id}',
        '${product.barcode}',
        $$${safeName}$$,
        '${product.category}',
        '${product.unit}',
        ${product.costPrice},
        ${product.salePrice},
        ${product.stock},
        ${product.minStock},
        '${calculateStatus(product.stock, product.minStock)}',
        ${product.image ? `'${product.image}'` : 'NULL'},
        '${product.updatedAt}'
      )`;
    }).join(',\n');

    await pool.query(`
      INSERT INTO products (
        id, barcode, name, category, unit, cost_price,
        sale_price, stock, min_stock, status, image, updated_at
      ) VALUES
      ${insertParts};
    `);
  }

  const shiftCount = await pool.query('SELECT count(*) AS count FROM shift');
  if (Number(shiftCount.rows[0]?.count ?? 0) === 0) {
    const shift = INITIAL_SHIFT;
    await pool.query(
      `INSERT INTO shift (
        id, cashier_name, opened_at, initial_cash,
        total_sales_cash, total_sales_card, total_sales_qr,
        total_sales_amount, transactions_count, is_open
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        shift.id,
        shift.cashierName,
        shift.openedAt,
        shift.initialCash,
        shift.totalSalesCash,
        shift.totalSalesCard,
        shift.totalSalesQR,
        shift.totalSalesAmount,
        shift.transactionsCount,
        shift.isOpen
      ]
    );
  }

  const movementsCount = await pool.query('SELECT count(*) AS count FROM inventory_movements');
  if (Number(movementsCount.rows[0]?.count ?? 0) === 0 && INITIAL_MOVEMENTS.length > 0) {
    for (const movement of INITIAL_MOVEMENTS) {
      await pool.query(
        `INSERT INTO inventory_movements (
          id, product_id, product_name, barcode, type,
          quantity, previous_stock, new_stock, reason,
          timestamp, "user"
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          movement.id,
          movement.productId,
          movement.productName,
          movement.barcode,
          movement.type,
          movement.quantity,
          movement.previousStock,
          movement.newStock,
          movement.reason,
          movement.timestamp,
          movement.user
        ]
      );
    }
  }

  const salesCount = await pool.query('SELECT count(*) AS count FROM sales');
  if (Number(salesCount.rows[0]?.count ?? 0) === 0 && INITIAL_TRANSACTIONS.length > 0) {
    for (const tx of INITIAL_TRANSACTIONS) {
      await pool.query(
        `INSERT INTO sales (
          id, code, timestamp, items, subtotal,
          tax_amount, discount_amount, total_amount,
          payment_method, amount_paid, change_given,
          cashier_name, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          tx.id,
          tx.code,
          tx.timestamp,
          JSON.stringify(tx.items),
          tx.subtotal,
          tx.taxAmount,
          tx.discountAmount,
          tx.totalAmount,
          tx.paymentMethod,
          tx.amountPaid,
          tx.changeGiven,
          tx.cashierName,
          tx.status
        ]
      );
    }
  }
};

export const mapProductRows = (rows: any[]) => rows.map(mapProductRow);
