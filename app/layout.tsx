import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { Session } from "next-auth";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://media.j3rzy.dev"), // Don't remove as it'll break the `(await parent).metadataBase!` in `@/app/[filename]/page.tsx:16`
  title: "media.j3rzy.dev",
  description: "Jerzy's media host",
  openGraph: {
    type: "website",
    url: "https://media.j3rzy.dev",
    title: "media.j3rzy.dev",
    description: "Jerzy's media host",
    countryName: "United States",
    locale: "en_US",
    siteName: "media.j3rzy.dev",
  },
};

export default async function RootLayout( { children }: Readonly<{ children: React.ReactNode; }> )
{
  const session: Session | null = await auth();
  
  return (
    <SessionProvider session={session}>
      <html lang="en">
      <body className="antialiased bg-[#202020] text-white">
      {children}
      </body>
      </html>
    </SessionProvider>
  );
}
