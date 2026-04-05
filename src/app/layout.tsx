import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// DIN Pro — upright weights only, no italics per design spec.
const dinPro = localFont({
  variable: "--font-dinpro",
  display: "swap",
  src: [
    {
      path: "../../assets/fonts/dinpro/dinpro_light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../assets/fonts/dinpro/dinpro.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../assets/fonts/dinpro/dinpro_medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../assets/fonts/dinpro/dinpro_bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../assets/fonts/dinpro/dinpro_black.otf",
      weight: "900",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Vincent Guanco",
  description:
    "Paris-based photographer and videographer specializing in fashion, editorial, and cinema.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html
      lang="en"
      className={`${dinPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
