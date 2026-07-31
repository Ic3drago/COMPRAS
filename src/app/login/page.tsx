'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Lock, ShoppingBag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login } from '@/app/actions/auth';
import { useActionState } from 'react';

const initialState = { error: '' };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [role, setRole] = React.useState<'admin' | 'seller' | 'buyer'>('admin');

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/50 p-8 rounded-3xl shadow-2xl shadow-black/50">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4">
              <Store className="text-zinc-950 h-8 w-8" />
            </div>
            <h1 className="text-2xl font-semibold text-zinc-100">SIVM Pro</h1>
            <p className="text-zinc-400 text-sm mt-1">Selecciona tu perfil de acceso</p>
          </div>

          <form action={formAction} className="space-y-6">
            <input type="hidden" name="role" value={role} />
            
            {/* Role Selector */}
            <div className="flex gap-2 p-1 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  role === 'admin' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <User className="w-4 h-4" /> Admin
              </button>
              <button
                type="button"
                onClick={() => setRole('seller')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  role === 'seller' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Store className="w-4 h-4" /> Vendedor
              </button>
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  role === 'buyer' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> Cliente
              </button>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500" />
                </div>
                <Input 
                  name="password"
                  type="password"
                  placeholder={role === 'admin' ? "Contraseña de admin" : role === 'seller' ? "Contraseña de vendedor" : "Contraseña de cliente"}
                  className="pl-10 h-12 bg-zinc-950/50 border-zinc-800 text-zinc-100 focus-visible:ring-cyan-500/50 rounded-xl"
                  required
                />
              </div>
              <AnimatePresence>
                {state?.error && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-rose-400 text-sm text-center"
                  >
                    {state.error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            <Button 
              disabled={isPending}
              className={`w-full h-12 rounded-xl text-zinc-950 font-bold text-base hover:opacity-90 transition-all shadow-lg ${
                role === 'seller' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-cyan-500/20' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-purple-500/20'
              }`}
            >
              {isPending ? 'Verificando...' : 'Ingresar'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
