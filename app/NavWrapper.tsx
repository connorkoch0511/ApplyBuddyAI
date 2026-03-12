'use client'

import { SessionProvider } from 'next-auth/react'
import Nav from './Nav'

export default function NavWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Nav />
      <main>{children}</main>
    </SessionProvider>
  )
}
