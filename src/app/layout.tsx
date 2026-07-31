import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Kuis Seni Budaya - Kelas 2",
  description: "Game kuis interaktif Seni Budaya untuk anak kelas 2 SD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${baloo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-baloo)]">
        {children}
      </body>
    </html>
  );
}
