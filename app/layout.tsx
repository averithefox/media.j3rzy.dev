import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { Session } from "next-auth";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";

const metadataBase: URL = process.env.NODE_ENV === "production" ?
  new URL("https://media.j3rzy.dev") :
  new URL("http://localhost:3000")

export const metadata: Metadata = {
  metadataBase,
  title: "Jerzy's media host",
  description: "Jerzy's media host",
  openGraph: {
    type: "website",
    url: metadataBase.href,
    title: "Meow :3",
    description: "Jerzy's media host",
    countryName: "United States",
    locale: "en_US",
    siteName: "Hewwo :3",
    images: [
      {
        url: new URL("/og-image.png", metadataBase).href,
        width: 1600,
        height: 1372,
        alt: "Averi here :3",
      },
    ],
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
