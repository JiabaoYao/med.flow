import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediTrack",
  description: "Mini-EMR and Patient Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased font-sans">{children}</body>
    </html>
  );
}
