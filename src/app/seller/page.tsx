import { SellerSpatialDashboard } from "@/components/blocks/seller-spatial-dashboard"
import { getProducts } from "@/app/actions/inventory"

export default async function SellerPage() {
  const initialProducts = await getProducts();
  return <SellerSpatialDashboard initialProducts={initialProducts} />
}
