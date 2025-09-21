import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/providers/NextAuthProvider";
import { Layout } from "@/layouts/Layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sukima Piece",
  description: "Sukima Pieceは、あなたの空き時間を活用して、新しい体験や発見を提供するサービスです。短時間で楽しめるアクティビティやイベントを提案し、日常に彩りを加えます。さあ、Sukima Pieceであなたの空き時間を有意義に使いましょう！",
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
      </body>
    </html>
  );
}
