import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
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
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
