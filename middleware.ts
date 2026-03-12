export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/dashboard/:path*', '/jobs/:path*', '/applications/:path*', '/profile/:path*', '/cover-letter/:path*', '/resume/:path*', '/interview/:path*'],
}
