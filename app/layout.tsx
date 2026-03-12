import type { Metadata } from 'next'
import './globals.css'
import NavWrapper from './NavWrapper'

export const metadata: Metadata = {
  title: 'ApplyBuddyAI - Apply to 100s of Jobs in Minutes with AI',
  description: 'AI-powered job application platform. Generate cover letters, optimize resumes, track applications, and ace interviews.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        <NavWrapper>
          {children}
        </NavWrapper>
      </body>
    </html>
  )
}
