import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { ThemeProvider } from "./components/theme-provider";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeadFlow",
  description: "Track every lead, every conversation and every follow-up.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${bricolage.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}