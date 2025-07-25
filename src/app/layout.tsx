import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Codash",
  description: "Track your coding journey",
  icons: {
    icon: "/favicon.ico", // or /favicon.png or /favicon.svg
  },
};
 
// These styles apply to every route in the application
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}