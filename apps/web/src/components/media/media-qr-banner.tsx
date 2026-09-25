import type { ReactNode } from 'react';
import { ExternalLink, QrCode } from 'lucide-react';
import { ScrollReveal } from '@/components/home/scroll-reveal';
import { QrCodeSvg } from '@/components/ui/qr-code';

interface MediaQrBannerProps {
  url: string;
  icon: ReactNode;
  badgeText?: string;
  title: string;
  description: string;
  buttonLabel: string;
  scanLabel: string;
}

export function MediaQrBanner({
  url,
  icon,
  badgeText,
  title,
  description,
  buttonLabel,
  scanLabel,
}: MediaQrBannerProps) {
  const link = url.trim();
  if (!link) return null;

  return (
    <ScrollReveal className="mt-8 sm:mt-10">
      <div className="from-brand-blue to-brand-violet relative isolate flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden rounded-3xl bg-gradient-to-br px-6 py-6 sm:px-8 sm:py-7 md:px-10 md:py-8 text-white shadow-xl">
        {/* Left: Icon, Badge, Title, Description, Button */}
        <div className="flex flex-1 flex-col items-start justify-center max-w-xl">
          <div className="flex items-center gap-3.5">
            <span
              aria-hidden="true"
              className="glass-invert flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-inner"
            >
              {icon}
            </span>
            <div>
              {badgeText && (
                <span className="text-xs font-bold tracking-widest text-brand-cyan uppercase">
                  {badgeText}
                </span>
              )}
              <h3 className="text-lg sm:text-2xl font-bold tracking-tight">{title}</h3>
            </div>
          </div>

          <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-white/85">{description}</p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glow text-brand-blue inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold shadow-lg hover:bg-white/95 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {buttonLabel}
              <ExternalLink aria-hidden="true" className="size-4" />
            </a>
          </div>
        </div>

        {/* Right: QR Code card */}
        <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-3.5 sm:p-4 backdrop-blur-xl shadow-2xl self-center md:self-auto">
          <QrCodeSvg
            value={link}
            size={196}
            className="rounded-xl shadow-md p-2 transition-transform duration-300 hover:scale-105"
          />
          <div className="mt-2 flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-cyan">
              <QrCode className="size-3.5" />
              QR Code
            </span>
            <p className="mt-0.5 text-xs font-medium text-white/85 max-w-[190px] leading-tight">
              {scanLabel}
            </p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
