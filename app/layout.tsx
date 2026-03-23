import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'LeadIQ Pro — AI Lead Intelligence',
  description: 'AI-Powered Lead Intelligence for B2B Growth',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111',
              color: '#fff',
              fontSize: '13px',
              borderRadius: '8px',
              border: '1px solid #222',
            },
            success: { iconTheme: { primary: '#fff', secondary: '#111' } },
            error: { iconTheme: { primary: '#fff', secondary: '#ef4444' } },
          }}
        />
      </body>
    </html>
  )
}