"use client";

import { Inter } from "next/font/google";
import "@/globals.css";
import "@radix-ui/themes/styles.css";
import { trpc } from "@/utils/trpc";
import { Separator, Theme } from "@radix-ui/themes";
import clsx from "clsx";
import Sidebar from "@/components/sidebar";

const inter = Inter({ subsets: ["latin"] });

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Gemini Web</title>
      </head>
      <body className={clsx(inter.className)}>
        <Theme accentColor="gray" grayColor="slate">
          <div className="h-screen flex flex-row">
            <Sidebar />
            <Separator orientation="vertical" size="4" />
            <div className="grow p-4">{children}</div>
          </div>
        </Theme>
      </body>
    </html>
  );
}

export default trpc.withTRPC(RootLayout);
