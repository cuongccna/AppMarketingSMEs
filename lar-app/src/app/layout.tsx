import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://larai.vn'),
  title: 'LAR - Local AI Responder | AI Danh Tiếng Việt',
  description: 'Tự động hóa quản lý và phản hồi đánh giá khách hàng trên Google Business Profile và Zalo OA cho SME Việt Nam',
  keywords: ['review management', 'AI response', 'Google Business Profile', 'Zalo OA', 'SME Vietnam', 'reputation management'],
  authors: [{ name: 'LAR Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LAR',
  },
  openGraph: {
    title: 'LAR - Local AI Responder',
    description: 'Quản lý danh tiếng địa phương bằng AI cho SME Việt Nam',
    type: 'website',
    images: ['/images/logo.svg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
