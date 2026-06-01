import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/ui/Toast";
import Navbar from "@/components/Navbar";
import GlobalModals from "@/components/GlobalModals";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Populi — Incidencias Ciudadanas",
  description:
    "Plataforma cívica de reporte y verificación colectiva de incidencias urbanas. Reporta baches, fugas, luminarias y más en tu ciudad.",
  keywords: ["incidencias", "ciudadanas", "reportes", "urbanos", "baches", "ciudad"],
  openGraph: {
    title: "Populi — Incidencias Ciudadanas",
    description:
      "Plataforma cívica de reporte y verificación colectiva de incidencias urbanas.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0f1a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg-deep text-text-primary">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <GlobalModals />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
