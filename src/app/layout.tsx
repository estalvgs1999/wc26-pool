import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const geist = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'WC26 Pool',
  description: 'Quiniela del Mundial 2026',
  icons: {
    icon: '/wc26-emblem.png',
    apple: '/wc26-emblem.png',
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent' },
}

export const viewport: Viewport = {
  themeColor: '#010915',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className={`${geist.variable} font-sans bg-wc-navy text-white min-h-dvh antialiased`}>
        {children}
      </body>
    </html>
  )
}
