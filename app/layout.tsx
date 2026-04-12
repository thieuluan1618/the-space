import type { Metadata } from 'next'
import { Inter, Space_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'The Space — Trinh Chau',
  description: 'A curated digital gallery showcasing the fashion design work of Trinh Chau.',
  openGraph: {
    title: 'The Space — Trinh Chau',
    description: 'Explore curated collections of hand-crafted fashion design.',
    type: 'website',
    url: 'https://thespacepy.com',
    images: [{
      url: 'https://thespacepy.com/og-image.jpg',
      width: 1200,
      height: 630,
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Space — Trinh Chau',
    description: 'A curated digital gallery of fashion design.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceMono.variable}`}>
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${inter.className} bg-background text-on-surface antialiased`}>
        {children}
      </body>
    </html>
  )
}
