import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AboutPage, Locale, OrganizationRole } from '@sif/shared';
import { strapiFetchOptional } from '@/lib/strapi';
import { seoMetadata } from '@/lib/metadata';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout/container';
import { EmptyState } from '@/components/layout/section';
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { RichText } from '@/components/rich-text';
import { AboutHero } from '@/components/about/about-hero';
import {
  ORGANIZATION_ROLES,
  Organizations,
  isOrganizationRole,
} from '@/components/about/organizations';

type Props = { params: Promise<{ locale: string }> };

function getAboutPage(locale: string) {
  return strapiFetchOptional<AboutPage>('about-page', {
    locale: locale as Locale,
    query: {
      'populate[organizations][populate]': 'logo',
      'populate[seo][populate]': 'ogImage',
    },
    tags: ['about-page'],
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, page] = await Promise.all([
    getTranslations({ locale, namespace: 'about' }),
    getAboutPage(locale),
  ]);

  return seoMetadata(page?.seo, {
    title: t('title'),
    description: page?.mission,
    locale,
    href: '/about',
  });
}

/**
 * /about, on the dark palette end to end.
 *
 * The page used to alternate white bands with coloured ones, which left it
 * mostly white and mostly empty. Here the ground is dark and continuous, the
 * colour lives in the ground itself rather than in a band you scroll past, and
 * the vertical rhythm is tighter throughout — the previous 96px section
 * padding was most of the emptiness on its own.
 *
 * Order: the partners come before the story. They are the page's one piece of
 * scannable content — six logos read at a glance — and putting four paragraphs
 * of prose ahead of them buried the answer to the question the page title
 * actually asks.
 *
 * `className="dark"` is what makes this cheap: it flips the semantic tokens
 * for this subtree only, so `.glass`, `--muted-foreground` and every border
 * resolve against the dark palette without a single per-component override.
 * See the `.page-deep` note in globals.css.
 */
export default async function About({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('about');
  const page = await getAboutPage(locale);

  /** Only roles the UI knows how to place; anything else is ignored. */
  const organizations = (page?.organizations ?? []).filter((organization) =>
    isOrganizationRole(organization.role),
  );

  const roleLabels = Object.fromEntries(
    ORGANIZATION_ROLES.map((role) => [role, t(`roles.${role}`)]),
  ) as Record<OrganizationRole, string>;

  /**
   * The tagline carries the headline when there is one, with the page name
   * demoted to the eyebrow above it — a one-line statement is a far stronger
   * opening than the words "About us" set large. Without a tagline the page
   * name takes the headline back, and the eyebrow is dropped rather than
   * repeating it.
   */
  const headline = page?.mission ?? t('title');
  const eyebrow = page?.mission ? t('title') : null;

  return (
    <div className="page-deep dark text-foreground">
      <AboutHero title={headline} eyebrow={eyebrow} />

      {/* ─── Who is behind the festival ────────────────────────────────── */}
      {organizations.length > 0 && (
        <section className="band-inset relative isolate overflow-hidden py-16 sm:py-20">
          {/* Grid moment 2 of 2. */}
          <div aria-hidden="true" className="grid-motif text-white" />

          <Container>
            <ScrollReveal className="group text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t('organizerTitle')}
              </h2>
              <span aria-hidden="true" className="rule-accent mx-auto mt-5" />
            </ScrollReveal>

            <div className="mt-12">
              <Organizations organizations={organizations} labels={roleLabels} />
            </div>
          </Container>
        </section>
      )}

      {/* ─── The story ─────────────────────────────────────────────────── */}
      <section className="pb-16 sm:pb-20">
        <Container>
          {/* 54rem, not the 3xl the bare column used: the card's 48px padding
              comes off the text width, so a 3xl card holds only 672px of prose
              and the measure drops to 55 characters. 864 − 96 puts it back to
              the 768px that reads at ~63. */}
          {/* On a phone the card's padding is the whole problem: 32px a side
              off a 343px card leaves 277px of text, which at 18px is 23
              characters a line — unreadably narrow. Below `sm` the card goes
              slim and the type drops to 16px, putting the measure back to 28,
              which is what the bare column managed before there was a card. */}
          <ScrollReveal className="group glass mx-auto max-w-[54rem] rounded-3xl px-5 py-8 text-base sm:p-12 sm:text-lg">
            <span aria-hidden="true" className="rule-accent mb-8" />
            {page ? <RichText content={page.story} /> : <EmptyState>{t('title')}</EmptyState>}
          </ScrollReveal>
        </Container>
      </section>

      {/* ─── Closing CTA ───────────────────────────────────────────────── */}
      <section className="pt-4 pb-20 sm:pb-28">
        <Container>
          <ScrollReveal>
            <div className="from-brand-blue to-brand-violet relative isolate overflow-hidden rounded-3xl bg-gradient-to-br px-6 py-14 text-center sm:px-12">
              <div
                aria-hidden="true"
                className="bg-brand-cyan/30 animate-float-slow absolute -top-24 -right-16 -z-10 size-72 rounded-full blur-3xl"
              />

              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
                {t('ctaTitle')}
              </h2>
              {/* Solid white: 18px regular needs 4.5:1, which rules out the
                  softened white this block used to carry. */}
              <p className="mx-auto mt-5 max-w-xl text-lg text-white">{t('ctaBody')}</p>

              {/* White-filled, not `bg-primary`: a blue button on a blue-violet
                  ground is invisible. */}
              <div className="mt-9 flex justify-center">
                <Link
                  href="/contact"
                  className="btn-glow text-brand-blue inline-flex rounded-full bg-white px-8 py-4 text-sm font-semibold tracking-wide uppercase"
                >
                  {t('ctaPrimary')}
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </div>
  );
}
