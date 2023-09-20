import "./globals.css";
import "@mantine/core/styles.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import { theme } from "@/theme";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Situation Puzzle - Playing with AI",
  description: "Situation Puzzle - Playing with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={inter.className}>
        <div className="absolute inset-0 max-h-[1368px] overflow-hidden pointer-events-none touch-none select-none">
          <Image
            className="absolute -top-[100px] -left-[300px] sm:-left-[200px] -z-10 pointer-events-none touch-none select-none object-fill max-w-none"
            src="/assets/bg1.png"
            alt=""
            width="1728"
            height="1368"
          />
          <Image
            className="absolute top-[150px] -right-[400px] sm:-right-[300px] -z-10 pointer-events-none touch-none select-none object-fill max-w-none"
            src="/assets/bg2.png"
            alt=""
            width="1728"
            height="1136"
          />
        </div>
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
