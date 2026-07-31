import { SivmDashboard } from "@/components/blocks/sivm-pos-dashboard"
import { getProducts } from "@/app/actions/inventory"
import { LogOut } from "lucide-react"
import { logout } from "@/app/actions/auth"

export default async function Home() {
  const initialProducts = await getProducts();
  
  return (
    <>
      <form action={logout} className="absolute top-4 right-4 z-50">
        <button className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur border border-zinc-800 px-4 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Salir</span>
        </button>
      </form>
      <SivmDashboard initialProducts={initialProducts} />
    </>
  );
}
