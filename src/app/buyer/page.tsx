import { getProducts } from "@/app/actions/inventory"
import { BuyerSpatialDashboard } from "@/components/blocks/buyer-spatial-dashboard"

export default async function BuyerPage() {
  const initialProducts = await getProducts();
  
  return <BuyerSpatialDashboard initialProducts={initialProducts} />
}
