const { Client } = require('pg');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('No DATABASE_URL found in .env');
  process.exit(1);
}

const seedData = require('./seed-data');
const seedProducts = seedData.products;
const seedShift = seedData.shift;
const seedTransactions = seedData.transactions;
const seedMovements = seedData.movements;

const calculateStatus = (stock, minStock) => {
  if (stock <= 0) return 'out_of_stock';
  if (stock <= minStock) return 'low_stock';
  return 'in_stock';
};

(async () => {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  try {
    await client.connect();

    console.log('Creating tables if needed...');
    await client.query(`
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

    console.log('Inserting seed data...');

    const existingProducts = await client.query('SELECT barcode FROM products');
    const existingBarcodes = new Set(existingProducts.rows.map(r => r.barcode));

    for (const product of seedProducts) {
      if (existingBarcodes.has(product.barcode)) continue;
      await client.query(
        `INSERT INTO products (
          id, barcode, name, category, unit, cost_price,
          sale_price, stock, min_stock, status, image, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          product.id,
          product.barcode,
          product.name,
          product.category,
          product.unit,
          product.costPrice,
          product.salePrice,
          product.stock,
          product.minStock,
          calculateStatus(product.stock, product.minStock),
          product.image || null,
          product.updatedAt
        ]
      );
    }

    const shiftCount = await client.query('SELECT count(*) AS count FROM shift');
    if (Number(shiftCount.rows[0].count) === 0) {
      await client.query(
        `INSERT INTO shift (
          id, cashier_name, opened_at, initial_cash,
          total_sales_cash, total_sales_card, total_sales_qr,
          total_sales_amount, transactions_count, is_open
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          seedShift.id,
          seedShift.cashierName,
          seedShift.openedAt,
          seedShift.initialCash,
          seedShift.totalSalesCash,
          seedShift.totalSalesCard,
          seedShift.totalSalesQR,
          seedShift.totalSalesAmount,
          seedShift.transactionsCount,
          seedShift.isOpen
        ]
      );
    }

    const shiftExists = Number((await client.query('SELECT count(*) AS count FROM shift')).rows[0].count) > 0;
    if (!shiftExists) {
      console.log('Inserted shift data');
    }

    const existingSales = await client.query('SELECT id FROM sales');
    const existingSaleIds = new Set(existingSales.rows.map(r => r.id));
    for (const tx of seedTransactions) {
      if (existingSaleIds.has(tx.id)) continue;
      await client.query(
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

    const existingMovements = await client.query('SELECT id FROM inventory_movements');
    const existingMovementIds = new Set(existingMovements.rows.map(r => r.id));
    for (const mov of seedMovements) {
      if (existingMovementIds.has(mov.id)) continue;
      await client.query(
        `INSERT INTO inventory_movements (
          id, product_id, product_name, barcode, type,
          quantity, previous_stock, new_stock, reason,
          timestamp, "user"
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          mov.id,
          mov.productId,
          mov.productName,
          mov.barcode,
          mov.type,
          mov.quantity,
          mov.previousStock,
          mov.newStock,
          mov.reason,
          mov.timestamp,
          mov.user
        ]
      );
    }

    console.log('Seed complete.');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await client.end();
  }
})();
