import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/lib/store';
import { ToastContainer } from '@/components/ui/ToastContainer';

export const metadata: Metadata = {
  title: 'SIVM - Sistema de Información de Ventas para Micromercado',
  description: 'Interfaz moderna para la digitalización de operaciones de caja, inventario y ventas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen">
        <StoreProvider>
          {children}
          <ToastContainer />
        </StoreProvider>
      </body>
    </html>
  );
}
