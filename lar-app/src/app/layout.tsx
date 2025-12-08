import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const metadata: Metadata = {
  title: 'LAR - Local AI Responder | AI Danh Tiếng Việt',
  description: 'Tự động hóa quản lý và phản hồi đánh giá khách hàng trên Google Business Profile và Zalo OA cho SME Việt Nam',
  keywords: ['review management', 'AI response', 'Google Business Profile', 'Zalo OA', 'SME Vietnam', 'reputation management'],
  authors: [{ name: 'LAR Team' }],
  openGraph: {
    title: 'LAR - Local AI Responder',
    description: 'Quản lý danh tiếng địa phương bằng AI cho SME Việt Nam',
    type: 'website',
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
