import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Mail, Phone, Share2, Sparkles, Send, MapPin } from 'lucide-react';
import type { Locale, SiteSettings } from '@sif/shared';
import { strapiFetchOptional } from '@/lib/strapi';
import { Container } from '@/components/layout/container';
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
    <div className="dark relative min-h-[calc(100vh-5rem)] overflow-hidden bg-brand-navy text-white">
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

      {/* Header section */}
      <div className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 border-b border-white/10">
        <Container>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/40 bg-brand-cyan/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-brand-cyan backdrop-blur-md">
              <Sparkles className="size-3.5" />
              <span>{t('eyebrow')}</span>
            </div>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl font-display">
              <span className="gradient-text-aurora">{t('title')}</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl">
              {t('intro')}
            </p>
          </div>
        </Container>
      </div>

      {/* Main Grid Content */}
      <Container className="py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14 items-start">
          {/* Form Container */}
          <div className="relative rounded-3xl border border-white/15 bg-white/[0.04] p-6 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl font-display">
                  {t('formTitle')}
                </h2>
                <p className="text-xs sm:text-sm text-white/60 mt-1">{t('formIntro')}</p>
              </div>
              <div className="hidden sm:flex size-11 items-center justify-center rounded-2xl border border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan">
                <Send className="size-5" />
              </div>
            </div>

            <ContactForm />
          </div>

          {/* Contact Details & Info Cards */}
          <div className="space-y-6">
            {/* Direct Contact Card */}
            <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-6 sm:p-8 backdrop-blur-2xl shadow-xl">
              <h2 className="text-sm font-bold tracking-wider uppercase text-brand-cyan flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-brand-cyan animate-pulse" />
                {t('infoTitle')}
              </h2>

              <dl className="mt-6 space-y-4">
                {settings?.contactEmail && (
                  <div className="flex items-start gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-brand-cyan/40 hover:bg-white/[0.05] transition-all">
                    <div className="size-10 shrink-0 rounded-xl bg-brand-cyan/15 text-brand-cyan flex items-center justify-center border border-brand-cyan/30">
                      <Mail className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <dt className="text-xs font-semibold text-white/50 tracking-wider uppercase">
                        {t('email')}
                      </dt>
                      <dd className="mt-1">
                        <a
                          href={`mailto:${settings.contactEmail}`}
                          className="text-sm sm:text-base font-semibold text-white hover:text-brand-cyan transition-colors break-all"
                        >
                          {settings.contactEmail}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}

                {settings?.contactPhone && (
                  <div className="flex items-start gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-brand-mint/40 hover:bg-white/[0.05] transition-all">
                    <div className="size-10 shrink-0 rounded-xl bg-brand-mint/15 text-brand-mint flex items-center justify-center border border-brand-mint/30">
                      <Phone className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <dt className="text-xs font-semibold text-white/50 tracking-wider uppercase">
                        {t('phone')}
                      </dt>
                      <dd className="mt-1">
                        <a
                          href={`tel:${settings.contactPhone.replace(/\s/g, '')}`}
                          className="text-sm sm:text-base font-semibold text-white hover:text-brand-mint transition-colors"
                        >
                          {settings.contactPhone}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div className="size-10 shrink-0 rounded-xl bg-brand-violet/15 text-brand-violet flex items-center justify-center border border-brand-violet/30">
                    <MapPin className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <dt className="text-xs font-semibold text-white/50 tracking-wider uppercase">
                      {t('location')}
                    </dt>
                    <dd className="mt-1 text-sm sm:text-base font-medium text-white/90">
                      {t('locationValue')}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            {/* Social channels */}
            {settings?.socialLinks && settings.socialLinks.length > 0 && (
              <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-6 sm:p-8 backdrop-blur-2xl shadow-xl">
                <h3 className="text-sm font-semibold tracking-wider uppercase text-white/70 flex items-center gap-2">
                  <Share2 className="size-4 text-brand-cyan" />
                  {t('social')}
                </h3>
                <div className="mt-5 flex flex-wrap gap-3">
                  {settings.socialLinks.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white/90 transition-all duration-200 hover:border-brand-cyan/50 hover:bg-brand-cyan/15 hover:text-brand-cyan"
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
          </div>
        </div>
      </Container>
    </div>
  );
}
