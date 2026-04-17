import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BioForge",
  description: "Generate standout short bios in seconds"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
