import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Hebrew } from "next/font/google";
import LocaleProvider from "../components/common/localeProvider";
import "./globals.css";

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
        {/*
          LocaleProvider reads the persisted locale from the Zustand store
          after hydration and updates <html lang> and <html dir> on the DOM.
          It also renders the shared Header so every page gets it automatically.
        */}
        <LocaleProvider />
        <main id="main-content" className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
