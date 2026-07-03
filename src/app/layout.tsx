import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({ subsets: ["latin"], variable: "--font-baloo" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "Robot School — teach a robot everything it knows",
  description:
    "Adopt a robot that knows nothing. Teach it to see, talk, and get things done — and learn how AI really works along the way. For kids 8–12.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${baloo.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
