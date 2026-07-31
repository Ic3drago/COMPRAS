import { AdminBentoDashboard } from "@/components/blocks/admin-bento-dashboard"
import { getProducts } from "@/app/actions/inventory"
import { getSales } from "@/app/actions/sales"

export default async function AdminPage() {
  const initialProducts = await getProducts();
  const initialSales = await getSales();

  return <AdminBentoDashboard initialProducts={initialProducts} initialSales={initialSales} />
}
