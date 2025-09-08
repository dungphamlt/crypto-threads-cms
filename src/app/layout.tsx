import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "./providers/ReactQueryProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crypto Threads CMS",
  description: "Content Management System for Slide Fun",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.ckeditor.com/ckeditor5/46.0.0/ckeditor5.css"
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-100`}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
          }}
        />
        <div className="min-h-screen">
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </div>
      </body>
    </html>
  );
}
