import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import LandscapeOrientation from "@/components/LandscapeOrientation";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Kuis Belajar Anak",
  description: "Game kuis interaktif berbagai mata pelajaran untuk anak SD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${baloo.variable} h-full overflow-hidden antialiased`}>
      <body className="h-dvh min-h-0 overflow-hidden flex flex-col font-[family-name:var(--font-baloo)]">
        <LandscapeOrientation>{children}</LandscapeOrientation>
      </body>
    </html>
  );
}
