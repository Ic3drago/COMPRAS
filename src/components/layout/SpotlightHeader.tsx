'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

export function SpotlightHeader() {
  const { searchQuery, setSearchQuery } = useStore();

  return (
    <header className="h-24 shrink-0 flex items-center justify-center border-b border-zinc-900/50 bg-black/80 backdrop-blur-md px-12 relative z-20">
      <motion.div 
        className="w-full max-w-3xl relative"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-zinc-500" />
        </div>
        <input
          id="spotlight-search"
          type="text"
          placeholder="Busca productos por nombre o código (Cmd+K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-16 brutalist-input rounded-none pl-16 pr-6 text-xl placeholder:text-zinc-600 bg-zinc-950 font-light tracking-wide focus:ring-1 focus:ring-cyan-500"
          autoComplete="off"
        />
        {/* Adorno tecnológico (Scanline o acento) */}
        <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300" />
      </motion.div>
    </header>
  );
}
