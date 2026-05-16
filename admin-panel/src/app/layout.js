"use client";

import "./globals.css";

import { Toaster } from "react-hot-toast";

import {
  ThemeProvider,
} from "next-themes";

export default function RootLayout({
  children,
}) {

  return (
    <html lang="en" suppressHydrationWarning>

      <body>

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
        >

          {/* Toast */}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#111",
                color: "#fff",
                borderRadius: "14px",
                padding: "16px",
              },
            }}
          />

          {children}

        </ThemeProvider>

      </body>

    </html>
  );
}