import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Container } from './container';

const quickLinks = [
  { key: 'agenda', href: '/agenda' },
  { key: 'exhibition', href: '/exhibition' },
  { key: 'sponsors', href: '/sponsors' },
  { key: 'location', href: '/location' },
  { key: 'news', href: '/news' },
  { key: 'contact', href: '/contact' },
] as const;

interface SiteFooterProps {
  siteName: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  socialLinks?: { platform: string; url: string }[];
  footerText?: string | null;
}

export function SiteFooter({
  siteName,
  contactEmail,
  contactPhone,
  socialLinks = [],
  footerText,
}: SiteFooterProps) {
  const t = useTranslations();

  return (
    <footer className="border-border bg-secondary/40 mt-24 border-t">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="text-lg font-bold tracking-tight">{siteName}</p>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm">
            {footerText ?? t('site.tagline')}
          </p>
        </div>

        <nav aria-label={t('footer.quickLinks')}>
          <h2 className="text-sm font-semibold">{t('footer.quickLinks')}</h2>
          <ul className="mt-3 space-y-2">
            {quickLinks.map(({ key, href }) => (
              <li key={key}>
                <Link href={href} className="text-muted-foreground hover:text-foreground text-sm">
                  {t(`nav.${key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold">{t('footer.contact')}</h2>
          <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
            {contactEmail && (
              <li>
                <a href={`mailto:${contactEmail}`} className="hover:text-foreground">
                  {contactEmail}
                </a>
              </li>
            )}
            {contactPhone && (
              <li>
                <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="hover:text-foreground">
                  {contactPhone}
                </a>
              </li>
            )}
          </ul>

          {socialLinks.length > 0 && (
            <>
              <h2 className="mt-6 text-sm font-semibold">{t('footer.follow')}</h2>
              <ul className="mt-3 flex flex-wrap gap-3">
                {socialLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground text-sm"
                    >
                      {link.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </Container>

      <Container className="border-border text-muted-foreground border-t py-6 text-xs">
        © {new Date().getFullYear()} {siteName}. {t('footer.rights')}
      </Container>
    </footer>
  );
}
