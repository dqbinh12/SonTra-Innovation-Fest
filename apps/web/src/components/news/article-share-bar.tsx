'use client';

import { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ArticleShareBarProps {
  title: string;
  url?: string;
}

export function ArticleShareBar({ title, url }: ArticleShareBarProps) {
  const t = useTranslations('news');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="my-8 flex flex-wrap items-center justify-between gap-4 border-y border-border/40 py-4">
      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/90">
        <Share2 className="size-4 text-brand-cyan" />
        <span>{t('shareStory')}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="glass hover:border-brand-cyan/60 hover:text-white inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white/90 transition-all active:scale-95"
          title={t('copyLink')}
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-brand-mint" strokeWidth={2.5} />
              <span className="text-brand-mint">{t('copied')}</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5 text-brand-cyan" />
              <span>{t('copyLink')}</span>
            </>
          )}
        </button>

        <a
          href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="glass hover:border-brand-cyan/60 hover:text-white inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white/80 transition-all hover:-translate-y-0.5"
          aria-label="Share on X"
        >
          X
        </a>

        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="glass hover:border-brand-cyan/60 hover:text-white inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white/80 transition-all hover:-translate-y-0.5"
          aria-label="Share on Facebook"
        >
          FB
        </a>

        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="glass hover:border-brand-cyan/60 hover:text-white inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white/80 transition-all hover:-translate-y-0.5"
          aria-label="Share on LinkedIn"
        >
          LinkedIn
        </a>
      </div>
    </div>
  );
}
