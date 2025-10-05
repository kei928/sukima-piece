import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/providers/NextAuthProvider";
import { Layout } from "@/layouts/Layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sukima Piece",
  description: "そのすきま時間、何する？現在地から、今すぐできることを提案します",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.className} flex flex-col min-h-screen bg-slate-50`}
      >
        <NextAuthProvider>
          <Layout>
            {children}
          </Layout>
        </NextAuthProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
