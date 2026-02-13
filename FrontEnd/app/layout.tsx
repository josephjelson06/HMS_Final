import type { ReactNode } from "react";

import "../styles/index.css";

export const metadata = {
  title: "HMS Admin",
  description: "Hotel Management System Admin",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

