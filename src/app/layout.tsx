"use client";

import { Inter } from "next/font/google";
import "@/globals.css";
import "@radix-ui/themes/styles.css";
import { trpc } from "@/utils/trpc";
import { Theme } from "@radix-ui/themes";
import clsx from "clsx";

const inter = Inter({ subsets: ["latin"] });

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Gemini Web</title>
      </head>
      <body className={clsx(inter.className)}>
        <Theme className="h-screen">{children}</Theme>
      </body>
    </html>
  );
}

export default trpc.withTRPC(RootLayout);
