import AppPusherProvider from '@/providers/AppPusherProvider'
import ReactQueryProvider from '@/providers/ReactQueryProvider'
import ThemeProvider from '@/providers/ThemeProvider'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Analytics } from '@vercel/analytics/react'
import { GeistSans } from 'geist/font/sans'
import NextTopLoader from 'nextjs-toploader'
import './globals.css'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Next.js and Supabase Starter Kit',
  description: 'The fastest way to build apps with Next.js and Supabase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={GeistSans.className}
      // style={{ colorScheme: 'dark' }}
    >
      <body className="text-foreground">
        <NextTopLoader showSpinner={false} height={2} color="#2acf80" />
        <ThemeProvider
          // attribute="class"
          // defaultTheme="dark"
          // enableSystem
          disableTransitionOnChange
        >
          <AppPusherProvider>
            <ReactQueryProvider>
              <main className="flex min-h-screen flex-col">
                {children}
                <Analytics />{' '}
                {/* ^^ remove this if you are not deploying to vercel. See more at https://vercel.com/docs/analytics  */}
              </main>
              <ReactQueryDevtools initialIsOpen={false} />
            </ReactQueryProvider>
          </AppPusherProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
