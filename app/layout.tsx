import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "SUAVECITO",
  description: "Estudio sobre influencia social en la decisión de compra",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${jakarta.variable} font-sans`}>
      <body className="antialiased bg-brand-light text-brand-text min-h-screen selection:bg-brand-sage selection:text-white">
        {children}
      </body>
    </html>
  );
}
