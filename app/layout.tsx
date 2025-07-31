import type React from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { Inter } from "next/font/google"
import { ResponsiveLayout } from "@/components/responsive-layout"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Instagram Clone - Full Featured Social Media App",
  description: "A comprehensive Instagram clone with real-time messaging, stories, reels, and more",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ResponsiveLayout>{children}</ResponsiveLayout>
        </body>
      </html>
    </ClerkProvider>
  )
}
