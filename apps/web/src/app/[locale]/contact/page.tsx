import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Mail, Phone, Share2, Sparkles, Send, MapPin } from 'lucide-react';
import type { Locale, SiteSettings } from '@sif/shared';
import { strapiFetchOptional } from '@/lib/strapi';
import { Container } from '@/components/layout/container';
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { ContactForm } from '@/components/forms/contact-form';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  const site = await getTranslations({ locale, namespace: 'site' });

  return { title: t('title'), description: site('description') };
}

export default async function Contact({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('contact');
  const settings = await strapiFetchOptional<SiteSettings>('site-setting', {
    locale: locale as Locale,
    query: { 'populate[socialLinks]': 'true' },
    tags: ['site-setting'],
  });

  return (
    <div className="dark relative min-h-[calc(100vh-5rem)] overflow-x-clip bg-brand-navy text-white">
      {/* Dynamic background ambient glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/4 -z-10 size-[36rem] -translate-x-1/2 rounded-full bg-brand-cyan/15 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-20 -z-10 size-[32rem] rounded-full bg-brand-violet/20 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-10 -z-10 size-[30rem] rounded-full bg-brand-blue/25 blur-[110px]"
      />

      {/* Subtle tech grid background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,107,225,0.15),transparent_70%)] [background-size:32px_32px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]"
      />

      {/* Header section with balanced padding */}
      <div className="relative pt-20 pb-4 sm:pt-24 sm:pb-6 lg:pb-8 border-b border-white/10">
        <Container>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/40 bg-brand-cyan/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-cyan backdrop-blur-md">
              <Sparkles className="size-3" />
              <span>{t('eyebrow')}</span>
            </div>
            <h1 className="mt-3 text-xl font-bold tracking-tight sm:text-3xl lg:text-4xl font-display">
              <span className="gradient-text-aurora">{t('title')}</span>
            </h1>
            <p className="mt-2.5 text-xs sm:text-sm text-white/70 leading-relaxed max-w-xl">
              {t('intro')}
            </p>
          </div>
        </Container>
      </div>

      {/* Main Grid Content with balanced padding */}
      <Container className="py-6 sm:py-10 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-8 items-start">
          {/* Form Container */}
          <ScrollReveal direction="left" className="relative rounded-2xl sm:rounded-3xl border border-white/15 bg-white/[0.04] p-4.5 sm:p-6 lg:p-7 backdrop-blur-2xl shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 sm:mb-5">
              <div>
                <h2 className="text-sm font-bold tracking-tight text-white sm:text-lg font-display">
                  {t('formTitle')}
                </h2>
                <p className="text-xs text-white/60 mt-0.5">{t('formIntro')}</p>
              </div>
              <div className="hidden sm:flex size-9 items-center justify-center rounded-xl border border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan">
                <Send className="size-4" />
              </div>
            </div>

            <ContactForm />
          </ScrollReveal>

          {/* Contact Details & Info Cards */}
          <ScrollReveal direction="right" delay={100} className="space-y-4 sm:space-y-6">
            {/* Direct Contact Card */}
            <div className="rounded-2xl sm:rounded-3xl border border-white/15 bg-white/[0.04] p-4.5 sm:p-6 backdrop-blur-2xl shadow-xl">
              <h2 className="text-xs font-bold tracking-wider uppercase text-brand-cyan flex items-center gap-2">
                <span className="size-2 rounded-full bg-brand-cyan animate-pulse" />
                {t('infoTitle')}
              </h2>

              <dl className="mt-4 space-y-3">
                {settings?.contactEmail && (
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-brand-cyan/40 hover:bg-white/[0.05] transition-all">
                    <div className="size-9 shrink-0 rounded-lg bg-brand-cyan/15 text-brand-cyan flex items-center justify-center border border-brand-cyan/30">
                      <Mail className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <dt className="text-xs font-semibold text-white/50 tracking-wider uppercase">
                        {t('email')}
                      </dt>
                      <dd className="mt-0.5">
                        <a
                          href={`mailto:${settings.contactEmail}`}
                          className="text-xs sm:text-sm font-semibold text-white hover:text-brand-cyan transition-colors break-all"
                        >
                          {settings.contactEmail}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}

                {settings?.contactPhone && (
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-brand-mint/40 hover:bg-white/[0.05] transition-all">
                    <div className="size-9 shrink-0 rounded-lg bg-brand-mint/15 text-brand-mint flex items-center justify-center border border-brand-mint/30">
                      <Phone className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <dt className="text-xs font-semibold text-white/50 tracking-wider uppercase">
                        {t('phone')}
                      </dt>
                      <dd className="mt-0.5">
                        <a
                          href={`tel:${settings.contactPhone.replace(/\s/g, '')}`}
                          className="text-xs sm:text-sm font-semibold text-white hover:text-brand-mint transition-colors"
                        >
                          {settings.contactPhone}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                  <div className="size-9 shrink-0 rounded-lg bg-brand-violet/15 text-brand-violet flex items-center justify-center border border-brand-violet/30">
                    <MapPin className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <dt className="text-xs font-semibold text-white/50 tracking-wider uppercase">
                      {t('location')}
                    </dt>
                    <dd className="mt-0.5 text-xs sm:text-sm font-medium text-white/90">
                      {t('locationValue')}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            {/* Social channels */}
            {settings?.socialLinks && settings.socialLinks.length > 0 && (
              <div className="rounded-2xl sm:rounded-3xl border border-white/15 bg-white/[0.04] p-4.5 sm:p-6 backdrop-blur-2xl shadow-xl">
                <h3 className="text-xs font-semibold tracking-wider uppercase text-white/70 flex items-center gap-2">
                  <Share2 className="size-3.5 text-brand-cyan" />
                  {t('social')}
                </h3>
                <div className="mt-3.5 flex flex-wrap gap-2">
                  {settings.socialLinks.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white/90 transition-all duration-200 hover:border-brand-cyan/50 hover:bg-brand-cyan/15 hover:text-brand-cyan"
                    >
                      <span>{link.platform}</span>
                      <span className="text-white/40 group-hover:translate-x-0.5 group-hover:text-brand-cyan transition-transform">
                        ↗
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </ScrollReveal>
        </div>
      </Container>
    </div>
  );
}
