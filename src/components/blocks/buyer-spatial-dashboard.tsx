"use client"

import * as React from "react"
import { logout } from "@/app/actions/auth"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { Search, ShoppingBag, Sparkles, X, ChevronRight, ChevronDown, Cpu, HardDrive, Monitor, Keyboard, Mouse, Headphones } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import type { Product } from "@/app/actions/inventory"
import { askAssistant } from "@/app/actions/ai"
import Image from "next/image"
import dynamic from "next/dynamic"

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => null,
})

const NAV_LINKS = [
  { label: "Inicio", href: "#hero" },
  { label: "Tienda", href: "#tienda" },
  { label: "Productos", href: "#productos" },
  { label: "Contacto", href: "#contacto" },
]

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Todos": <ShoppingBag className="w-4 h-4" />,
  "Procesadores": <Cpu className="w-4 h-4" />,
  "Almacenamiento": <HardDrive className="w-4 h-4" />,
  "Monitores": <Monitor className="w-4 h-4" />,
  "Teclados": <Keyboard className="w-4 h-4" />,
  "Ratones": <Mouse className="w-4 h-4" />,
  "Audio": <Headphones className="w-4 h-4" />,
}

export const BuyerSpatialDashboard = ({ initialProducts }: { initialProducts: Product[] }) => {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("Todos")
  const categories = ["Todos", ...Array.from(new Set(initialProducts.map(p => p.category)))]
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
  const [isChatOpen, setIsChatOpen] = React.useState(false)
  const [chatHistory, setChatHistory] = React.useState<{role: "user" | "model", text: string}[]>([])
  const [chatInput, setChatInput] = React.useState("")
  const [isAiTyping, setIsAiTyping] = React.useState(false)
  const chatScrollRef = React.useRef<HTMLDivElement>(null)
  const [splineLoaded, setSplineLoaded] = React.useState(false)
  const heroRef = React.useRef<HTMLDivElement>(null)
  const logoutFormRef = React.useRef<HTMLFormElement>(null)

  // Intercept Spline's hardcoded external links (like LinkedIn from templates)
  React.useEffect(() => {
    const originalOpen = window.open;
    window.open = function(url?: string | URL, target?: string, features?: string) {
      if (url && typeof url === 'string' && (url.includes('linkedin') || url.includes('twitter') || url.includes('http'))) {
        console.log('Intercepted Spline external link:', url);
        return null;
      }
      return originalOpen.apply(this, [url, target, features]);
    };

    return () => {
      window.open = originalOpen;
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9])
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])

  React.useEffect(() => {
    if(chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatHistory, isAiTyping])

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!chatInput.trim() || isAiTyping) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatHistory(prev => [...prev, {role: "user", text: userMsg}]);
    setIsAiTyping(true);
    const res = await askAssistant(chatHistory, userMsg);
    setChatHistory(prev => [...prev, {role: "model", text: res.text}]);
    setIsAiTyping(false);
  }

  const filteredProducts = initialProducts.filter(p =>
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedCategory === "Todos" || p.category === selectedCategory)
  ).filter(p => p.stock > 0)

  const scrollToSection = (href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  const handleSplineMouseDown = (e: any) => {
    const targetName = e.target?.name?.toLowerCase() || "";
    console.log("Clic en objeto 3D de Spline:", targetName, e.target);
    
    if (targetName.includes("home") || targetName.includes("inicio")) {
      scrollToSection("#hero");
    } else if (targetName.includes("contacto") || targetName.includes("contact")) {
      scrollToSection("#contacto");
    } else if (targetName.includes("cerrar") || targetName.includes("logout") || targetName.includes("sesion") || targetName.includes("salir") || targetName.includes("talk") || targetName.includes("let")) {
      // Map the "Let's Talk" button in their template to Log Out
      logoutFormRef.current?.requestSubmit();
    } else {
      // For any other button clicked
      scrollToSection("#tienda");
    }
  };

  return (
    <div className="bg-black text-white selection:bg-cyan-500/30 font-sans">
      
      {/* Hidden form for programmatic logout from Spline */}
      <form action={logout} ref={logoutFormRef} className="hidden">
        <button type="submit">Logout</button>
      </form>

      {/* ====================================================================
          SECTION 1 — HERO: Full-screen Spline 3D Landing
       ==================================================================== */}
      <section ref={heroRef} id="hero" className="relative w-full h-[100svh] overflow-hidden flex items-center justify-center">

        {/* Spline 3D Background */}
        <motion.div style={{ opacity: heroOpacity, scale: heroScale, y: heroY }} className="absolute inset-0 z-0 flex items-center justify-center">
          {/* Gradient fallback while Spline loads */}
          <div className="absolute inset-0">
            <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/25 blur-[180px] animate-pulse" />
            <div className="absolute top-[30%] right-[-15%] w-[55vw] h-[55vw] rounded-full bg-cyan-500/20 blur-[180px] animate-pulse" style={{animationDelay: '1s'}} />
            <div className="absolute bottom-[-15%] left-[15%] w-[65vw] h-[65vw] rounded-full bg-purple-600/20 blur-[180px] animate-pulse" style={{animationDelay: '2s'}} />
          </div>
          {/* Spline scene scaled up to take more space */}
          <div className={cn("absolute inset-0 transition-opacity duration-[2s] scale-[1.3] md:scale-[1.45]", splineLoaded ? "opacity-100" : "opacity-0")}>
            <Spline
              scene="https://prod.spline.design/1jHE6snShqqlYpKA/scene.splinecode"
              onLoad={() => setSplineLoaded(true)}
              onMouseDown={handleSplineMouseDown}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          {/* Overlay to darken borders if needed, making sure pointer events don't block clicks */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black pointer-events-none" />
        </motion.div>

        {/* Navigation is now handled entirely within the 3D Spline scene */}

        {/* Scroll Down Indicator */}
        <div className="relative z-20 h-full flex flex-col items-center justify-end pb-12 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex flex-col items-center gap-2 pointer-events-auto cursor-pointer"
            onClick={() => scrollToSection("#tienda")}
          >
            <span className="text-white/30 text-xs font-medium uppercase tracking-[0.3em]">Desliza</span>
            <ChevronDown className="w-5 h-5 text-white/30 animate-bounce" />
          </motion.div>
        </div>
      </section>


      {/* ====================================================================
          SECTION 2 — TIENDA: Products, Categories, Search
       ==================================================================== */}
      <section id="tienda" className="relative bg-zinc-950 min-h-screen">

        {/* Subtle top gradient connecting to hero */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent pointer-events-none z-10" />

        <div className="container mx-auto px-6 pt-20 pb-12 relative z-20">

          {/* Section Header */}
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50"
            >
              Catálogo de Productos
            </motion.h2>
            <p className="text-white/40 text-base max-w-xl mx-auto">
              Explora nuestra selección de hardware y accesorios. Filtra por categoría o busca directamente.
            </p>
          </div>

          {/* Search Bar */}
          <div id="productos" className="mb-8 max-w-2xl mx-auto relative group">
            <div className="absolute inset-0 bg-cyan-500/10 rounded-2xl blur-xl group-focus-within:bg-cyan-500/20 transition-all pointer-events-none" />
            <div className="relative">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-white/40" />
              </div>
              <Input
                type="text"
                placeholder="Buscar productos, placas base, procesadores..."
                className="w-full h-14 pl-14 pr-6 bg-white/5 border-white/10 rounded-2xl text-base text-white placeholder:text-white/25 backdrop-blur-2xl focus-visible:ring-cyan-500/50 shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-5 py-2 rounded-full text-xs font-semibold transition-all duration-300 border flex items-center gap-2",
                  selectedCategory === cat
                    ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-105"
                    : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white"
                )}
              >
                {CATEGORY_ICONS[cat] || <ShoppingBag className="w-4 h-4" />}
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {filteredProducts.map((product, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 150, damping: 20, delay: (index % 10) * 0.05 }}
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="group cursor-pointer relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity blur-lg" />
                  <div className="bg-zinc-900/80 border border-white/5 p-4 rounded-3xl backdrop-blur-sm h-full flex flex-col justify-between hover:border-white/15 transition-all hover:shadow-xl hover:shadow-cyan-500/5 overflow-hidden">
                    <div>
                      {product.image ? (
                        <div className="relative w-full h-36 mb-4 rounded-2xl overflow-hidden bg-black/30">
                          <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      ) : (
                        <div className="w-full h-36 mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-white/15" />
                        </div>
                      )}
                      <span className="bg-white/10 text-white/50 text-[10px] px-2 py-0.5 rounded-full font-mono inline-block mb-2">
                        {product.category}
                      </span>
                      <h3 className="text-sm font-semibold mb-1 line-clamp-2 leading-tight">{product.name}</h3>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-white/30 text-[10px] mb-0.5 uppercase">Precio</p>
                        <p className="text-lg font-black text-cyan-400">Bs. {product.sale_price.toFixed(2)}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredProducts.length === 0 && (
            <div className="text-center text-white/30 py-20 text-xl font-medium">
              No encontramos productos que coincidan con tu búsqueda.
            </div>
          )}
        </div>
      </section>


      {/* ====================================================================
          SECTION 3 — FOOTER: About, Contact, Copyright
       ==================================================================== */}
      <footer id="contacto" className="relative bg-black border-t border-white/5">
        <div className="container mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-12">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-cyan-500" />
                <span className="font-black text-lg">SIVM MicroMercado</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Somos tu tienda especializada en hardware, repuestos y accesorios de computadora.
                Ofrecemos productos de calidad con garantía y atención personalizada para técnicos y usuarios finales.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-white/70 mb-4 text-sm uppercase tracking-wider">Contacto</h4>
              <ul className="space-y-3 text-sm text-white/40">
                <li>📧 soporte@sivm.com</li>
                <li>📱 +591 700 00 000</li>
                <li>📍 La Paz, Bolivia</li>
                <li>🕐 Lun – Vie, 9:00 – 18:00</li>
              </ul>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-white/70 mb-4 text-sm uppercase tracking-wider">Ayuda</h4>
              <ul className="space-y-3 text-sm text-white/40">
                <li className="hover:text-white/60 transition-colors cursor-pointer">Preguntas Frecuentes</li>
                <li className="hover:text-white/60 transition-colors cursor-pointer">Política de Devoluciones</li>
                <li className="hover:text-white/60 transition-colors cursor-pointer">Términos y Condiciones</li>
                <li className="hover:text-white/60 transition-colors cursor-pointer">Política de Privacidad</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 text-center text-white/20 text-xs">
            © {new Date().getFullYear()} SIVM MicroMercado. Todos los derechos reservados.
          </div>
        </div>
      </footer>


      {/* ====================================================================
          FLOATING ELEMENTS: AI FAB, Product Modal, Chat Drawer
       ==================================================================== */}

      {/* AI Assistant FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/50 z-50 hover:shadow-cyan-500/70 transition-all group"
      >
        <Sparkles className="w-8 h-8 text-white group-hover:animate-pulse" />
      </motion.button>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-xl"
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="bg-zinc-900/95 backdrop-blur-2xl border border-white/10 w-full max-w-2xl rounded-[3rem] p-8 md:p-12 relative z-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />

              <button onClick={() => setSelectedProduct(null)} className="absolute top-8 right-8 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>

              <div className="mb-6 flex flex-col md:flex-row gap-8 items-start">
                {selectedProduct.image ? (
                  <div className="relative w-full md:w-1/3 aspect-square rounded-3xl overflow-hidden bg-black/20 flex-shrink-0 border border-white/10 shadow-2xl">
                    <Image src={selectedProduct.image} alt={selectedProduct.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  </div>
                ) : (
                  <div className="w-full md:w-1/3 aspect-square rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl">
                    <ShoppingBag className="w-16 h-16 text-white/20" />
                  </div>
                )}

                <div className="flex-1 w-full">
                  <span className="bg-white/10 text-white/70 text-sm px-4 py-2 rounded-full font-medium inline-block mb-4">
                    {selectedProduct.category}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">{selectedProduct.name}</h2>
                  <p className="text-white/50 text-lg font-mono mb-8">Código: {selectedProduct.barcode}</p>

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="text-white/50 text-sm mb-1 uppercase tracking-widest font-bold">Precio de Venta</p>
                      <p className="text-4xl font-black text-cyan-400">Bs. {selectedProduct.sale_price.toFixed(2)}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-white/50 text-sm mb-1 uppercase tracking-widest font-bold">Disponibilidad</p>
                      <p className="text-xl font-bold text-white">{selectedProduct.stock} {selectedProduct.unit}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Assistant Drawer */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-zinc-950/95 backdrop-blur-3xl border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            <div className="p-6 flex items-center justify-between border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Asistente SIVM</h3>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
              <div className="bg-white/10 rounded-2xl rounded-tl-sm p-4 max-w-[85%] self-start">
                <p className="text-sm">¡Hola! Soy tu asistente inteligente SIVM. ¿Buscas algún producto en especial o tienes dudas sobre nuestros precios?</p>
              </div>

              {chatHistory.map((msg, idx) => (
                <div key={idx} className={cn(
                  "p-4 max-w-[85%] text-sm shadow-xl",
                  msg.role === "user"
                    ? "self-end bg-cyan-500 text-black rounded-2xl rounded-tr-sm"
                    : "self-start bg-white/10 text-white rounded-2xl rounded-tl-sm"
                )}>
                  {msg.text}
                </div>
              ))}

              {isAiTyping && (
                <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 max-w-[85%] self-start flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: "0ms"}} />
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: "150ms"}} />
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: "300ms"}} />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-white/5">
              <form className="relative" onSubmit={handleSendChat}>
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Escribe tu pregunta..."
                  className="w-full bg-black/50 border-white/10 text-white rounded-full h-12 pl-6 pr-12 focus-visible:ring-cyan-500"
                />
                <button type="submit" disabled={isAiTyping} className="absolute right-2 top-2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-black hover:bg-cyan-400 transition-colors disabled:bg-zinc-600 disabled:text-zinc-400">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
