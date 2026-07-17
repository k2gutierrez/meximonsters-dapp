import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MexiMonsters | Dynamic On-Chain NFTs",
  description: "Transform High Society into Untamed Beasts. 100% on-chain SVG collectibles on Arbitrum & Ethereum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-zinc-100 selection:bg-red-600 selection:text-white overflow-x-hidden">
        <Providers>
          {children}
        </Providers>
        <Toaster position="bottom-right" theme="dark" closeButton richColors />
      </body>
    </html>
  );
}