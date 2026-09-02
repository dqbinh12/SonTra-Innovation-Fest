import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/**
 * Next.js 16 renamed the `middleware` file convention to `proxy`.
 * next-intl's handler is unchanged: it negotiates the locale and rewrites
 * localised pathnames (e.g. /vi/chuong-trinh -> /vi/agenda) onto the app routes.
 */
export default createMiddleware(routing);

export const config = {
  // Skip Next internals, API routes and anything with a file extension.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
