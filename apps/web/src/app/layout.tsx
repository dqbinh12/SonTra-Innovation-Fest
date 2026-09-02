/**
 * The real <html>/<body> live in app/[locale]/layout.tsx, where the active
 * locale is known. Next.js still requires a root layout to exist.
 */
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return children;
}
