import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NUMA — Sua assistente pessoal",
  description:
    "A Numa entende suas mensagens, resume conversas e ajuda você a focar no que realmente importa.",
  openGraph: {
    title: "NUMA — Sua assistente pessoal",
    description:
      "A Numa entende suas mensagens, resume conversas e ajuda você a focar no que realmente importa.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={interTight.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
