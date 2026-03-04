import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter, Inter_Tight } from "next/font/google";
import { ReactQueryProvider } from "@/components/react-query-provider";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://numa.app";
const title = "Numa - Sua assistente pessoal";
const description =
  "A Numa entende suas mensagens, resume conversas e ajuda voce a focar no que realmente importa.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: "/",
    images: [
      {
        url: "/mockup.png",
        width: 1200,
        height: 630,
        alt: "Numa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/mockup.png"],
  },
  icons: {
    icon: [
      {
        url: "/icons/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
    shortcut: "/icons/favicon.ico",
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
      },
    ],
  },
  manifest: "/icons/site.webmanifest",
  other: {
    "apple-mobile-web-app-title": "Numa",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${interTight.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
