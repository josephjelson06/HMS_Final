import { Poppins } from "next/font/google";
import type { ReactNode } from "react";

import "../styles/index.css";
import { ThemeProvider } from "@/presentation/providers/ThemeProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata = {
  title: "HMS Admin",
  description: "Hotel Management System Admin",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body className="font-sans antialiased text-slate-900 dark:text-white transition-colors">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
