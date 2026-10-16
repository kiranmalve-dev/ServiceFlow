import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Hebrew } from "next/font/google";
import "./globals.css";
import Header from "../components/common/header";
import LocaleProvider from "../components/common/LocaleProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansHebrew = Noto_Sans_Hebrew({
  variable: "--font-noto-hebrew",
  subsets: ["hebrew"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Service Booking",
  description: "Book services online – English & Hebrew",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansHebrew.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <LocaleProvider />
        <main id="main-content" className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
