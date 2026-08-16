import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinkHub - Sistema de Gestión Técnica, Inventario y Reportes PDF",
  description: "Plataforma para empresas de redes, CCTV, mantenimiento y reparación de equipos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased font-sans bg-[#F8F9FA] text-[#202124] min-h-[100dvh]">
        {children}
      </body>
    </html>
  );
}
