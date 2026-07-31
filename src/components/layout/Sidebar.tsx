'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { PackageSearch, ShoppingCart, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type TabType = 'pos' | 'inventario' | 'metricas';

export function Sidebar() {
  const { activeTab, setActiveTab } = useStore();

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'pos', label: 'POS', icon: <ShoppingCart size={20} /> },
    { id: 'inventario', label: 'INV', icon: <PackageSearch size={20} /> },
    { id: 'metricas', label: 'MET', icon: <BarChart3 size={20} /> },
  ];

  return (
    <aside className="w-16 h-full brutalist-panel border-r-0 border-y-0 border-l-0 flex flex-col items-center py-6 gap-6 shrink-0 relative z-10">
      {/* Logo/Brand Minimalista */}
      <div className="w-10 h-10 bg-white text-black font-black text-xl flex items-center justify-center numeric-mono">
        SV
      </div>

      <nav className="flex-1 flex flex-col gap-4 mt-8">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={cn(
                "w-12 h-12 flex flex-col items-center justify-center relative rounded-none transition-colors",
                isActive ? "text-cyan-400" : "text-zinc-500 hover:text-zinc-200"
              )}
            >
              {item.icon}
              <span className="text-[10px] font-bold tracking-widest mt-1 uppercase numeric-mono">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-cyan-500"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>
    </aside>
  );
}
