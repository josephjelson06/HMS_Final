"use client";

import type { ReactNode } from "react";

import { ThemeProvider } from "@/presentation/providers/ThemeProvider";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

