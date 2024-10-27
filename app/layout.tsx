import { MySessionProvider } from "@/components/provider/seesion";
import { ThemeProvider } from "@/components/provider/theme";
import type { Metadata } from "next";
import { Fira_Code } from 'next/font/google';
import "./globals.css";

const firaCode = Fira_Code({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "Node",
  description: "Manage your knowledge with Node",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className={`antialiased ${firaCode.className}`}>
        <MySessionProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            {children}
          </ThemeProvider>
        </MySessionProvider>
      </body>
    </html>
  );
}
