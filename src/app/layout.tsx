import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Where's My MEP? - European Parliament Attendance Tracker",
  description: 'Track attendance rates of Members of the European Parliament in roll-call votes over the last 180 days.',
  keywords: ['European Parliament', 'MEP', 'attendance', 'voting', 'democracy', 'transparency'],
  authors: [{ name: "Where's My MEP?" }],
  openGraph: {
    title: "Where's My MEP? - European Parliament Attendance Tracker",
    description: 'Track attendance rates of Members of the European Parliament in roll-call votes over the last 180 days.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Where's My MEP? - European Parliament Attendance Tracker",
    description: 'Track attendance rates of Members of the European Parliament in roll-call votes over the last 180 days.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
