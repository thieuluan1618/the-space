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

const SITE_URL = 'https://trinhchau.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Trinh Chau — The Space',
    template: '%s | Trinh Chau',
  },
  description: 'NTK Trinh Chau — nhà thiết kế thời trang với các bộ sưu tập đặc sắc. A curated digital gallery showcasing the fashion design work of Trinh Chau.',
  keywords: [
    'Trinh Chau',
    'NTK Trinh Chau',
    'nhà thiết kế Trinh Chau',
    'nhà thiết kế thời trang Trinh Chau',
    'Trinh Chau designer',
    'Trinh Chau fashion',
    'thiết kế thời trang',
    'thời trang Việt Nam',
    'The Space',
    'behind the scenes',
    'fashion journal',
    'design process',
  ],
  authors: [{ name: 'Trinh Chau', url: SITE_URL }],
  creator: 'Trinh Chau',
  publisher: 'The Space',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'Trinh Chau — The Space',
    description: 'NTK Trinh Chau — A curated digital gallery of fashion design collections.',
    type: 'website',
    url: SITE_URL,
    siteName: 'The Space',
    locale: 'vi_VN',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Trinh Chau — The Space',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trinh Chau — The Space',
    description: 'NTK Trinh Chau — A curated digital gallery of fashion design.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  other: {
    'article:publisher': SITE_URL,
    'schema:blog': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'The Space — Behind the Scenes',
      description: 'Behind-the-scenes insights, process notes, and journal entries from NTK Trinh Chau.',
      url: `${SITE_URL}/journal`,
      author: {
        '@type': 'Person',
        name: 'Trinh Chau',
        url: SITE_URL,
      },
      publisher: {
        '@type': 'Organization',
        name: 'The Space',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/og-image.jpg`,
        },
      },
    }),
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${spaceMono.variable}`}>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'The Space — Trinh Chau',
              url: SITE_URL,
              author: {
                '@type': 'Person',
                name: 'Trinh Chau',
                url: SITE_URL,
                jobTitle: 'Fashion Designer',
                description: 'NTK Trinh Chau — Vietnamese fashion designer.',
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE_URL}/journal?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} bg-background text-on-surface antialiased`}>
        {children}
      </body>
    </html>
  )
}