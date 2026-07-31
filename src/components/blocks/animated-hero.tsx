"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Monitor, Cpu, Keyboard, Layers, ArrowDown } from "lucide-react"

export const AnimatedHero = () => {
  const { scrollY } = useScroll()

  // Transformations for the "disassembly" effect on scroll
  // The screen goes up, keyboard goes down, motherboard separates
  const screenY = useTransform(scrollY, [0, 500], [0, -150])
  const screenRotate = useTransform(scrollY, [0, 500], [0, -10])
  
  const baseY = useTransform(scrollY, [0, 500], [0, 150])
  const baseRotate = useTransform(scrollY, [0, 500], [0, 10])

  const motherboardY = useTransform(scrollY, [0, 500], [0, 50])
  const motherboardScale = useTransform(scrollY, [0, 500], [1, 1.2])

  const opacityText = useTransform(scrollY, [100, 400], [0, 1])
  const mainOpacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <div className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden rounded-[3rem] bg-zinc-950/50 border border-white/5 mb-12">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      
      {/* 3D-ish Laptop Disassembly Layers */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl perspective-1000">
        
        <motion.div style={{ opacity: mainOpacity }} className="absolute text-center z-50 top-1/2 -translate-y-1/2">
          <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 mb-4">
            Bienvenido a SIVM
          </h1>
          <p className="text-white/60 text-lg md:text-xl flex items-center justify-center gap-2">
            Desliza para explorar <ArrowDown className="w-5 h-5 animate-bounce" />
          </p>
        </motion.div>

        {/* Screen Layer */}
        <motion.div 
          style={{ y: screenY, rotateX: screenRotate }}
          className="absolute w-64 h-40 md:w-96 md:h-64 border-4 border-zinc-800 rounded-xl bg-black/80 backdrop-blur-md flex items-center justify-center shadow-2xl shadow-cyan-500/20 z-30"
        >
          <div className="w-full h-full border border-white/10 rounded-lg m-2 flex items-center justify-center bg-cyan-950/30">
            <Monitor className="w-12 h-12 text-cyan-500/50" />
          </div>
        </motion.div>

        {/* Motherboard / Components Layer */}
        <motion.div 
          style={{ y: motherboardY, scale: motherboardScale }}
          className="absolute w-56 h-32 md:w-80 md:h-56 border-2 border-emerald-500/30 rounded-lg bg-emerald-950/40 backdrop-blur-md flex items-center justify-center shadow-xl shadow-emerald-500/20 z-20"
        >
          <div className="grid grid-cols-3 gap-2 opacity-50 p-4 w-full h-full">
             <div className="border border-emerald-500/50 rounded bg-emerald-500/20 col-span-2 flex items-center justify-center"><Cpu className="w-6 h-6 text-emerald-400" /></div>
             <div className="border border-emerald-500/50 rounded bg-emerald-500/20" />
             <div className="border border-emerald-500/50 rounded bg-emerald-500/20" />
             <div className="border border-emerald-500/50 rounded bg-emerald-500/20 col-span-2 flex items-center justify-center"><Layers className="w-6 h-6 text-emerald-400" /></div>
          </div>
        </motion.div>

        {/* Base / Keyboard Layer */}
        <motion.div 
          style={{ y: baseY, rotateX: baseRotate }}
          className="absolute w-64 h-32 md:w-96 md:h-48 border-4 border-zinc-800 rounded-xl bg-zinc-900 flex items-center justify-center shadow-2xl z-10"
        >
           <div className="w-[90%] h-[40%] mt-[-20%] border border-white/5 rounded grid grid-cols-12 gap-1 p-2 bg-black/50">
             {Array.from({length: 36}).map((_, i) => (
                <div key={i} className="bg-white/10 rounded-sm" />
             ))}
           </div>
           <div className="absolute bottom-4 w-1/3 h-8 border border-white/5 rounded bg-black/50" />
        </motion.div>

      </div>

      {/* Disassembled Explanatory Text */}
      <motion.div 
        style={{ opacity: opacityText }}
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-40 bg-black/40 backdrop-blur-[2px]"
      >
        <div className="max-w-2xl text-center p-8">
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
            Expertos en Tecnología
          </h2>
          <p className="text-white/80 text-lg md:text-xl leading-relaxed font-medium">
            En SIVM MicroMercado nos especializamos en hardware, repuestos y accesorios de computadora. 
            Calidad garantizada pieza por pieza.
          </p>
        </div>
      </motion.div>

    </div>
  )
}
