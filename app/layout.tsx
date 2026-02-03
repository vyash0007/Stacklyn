import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Force recompile
import { ClerkProvider } from "@clerk/nextjs";

import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Stacklyn",
  description: "Advanced Prompt Engineering with Version Control",
  icons: {
    icon: "/favicon-cropped.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_dummy";

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} min-h-screen bg-zinc-50 dark:bg-zinc-950`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
