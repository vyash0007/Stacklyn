import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { UserProvider } from "@/contexts/UserContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stacklyn",
  description: "Advanced Prompt Engineering with Version Control",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-zinc-50 dark:bg-zinc-950`}>
        <UserProvider>
          <div className="flex min-h-screen">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
