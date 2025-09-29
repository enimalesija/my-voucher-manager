import type { Metadata } from "next";
import { Inter, Fira_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers"; // wrap everything in QueryClientProvider

// Fonts 
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = Fira_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Voucher Manager",
  description: "Transiett voucher campaign manager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable}`}>
        {/* React Query context available everywhere */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
