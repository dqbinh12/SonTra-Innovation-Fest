'use client';

import { useState, useTransition } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

interface CategoryOption {
  key: string;
  label: string;
}

interface NewsFilterBarProps {
  query: string;
  category: string;
  categories: CategoryOption[];
  newsPath: string;
}

export function NewsFilterBar({ query, category, categories, newsPath }: NewsFilterBarProps) {
  const t = useTranslations('news');
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [prevQuery, setPrevQuery] = useState(query);
  const [searchValue, setSearchValue] = useState(query);

  if (query !== prevQuery) {
    setPrevQuery(query);
    setSearchValue(query);
  }

  const handleCategorySelect = (selectedCategory: string) => {
    const params = new URLSearchParams();
    if (searchValue.trim()) params.set('q', searchValue.trim());
    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }

    const qs = params.toString();
    const href = (qs ? `${pathname}?${qs}` : pathname) as '/news';

    startTransition(() => {
      router.push(href);
    });
  };

  const handleClearQuery = () => {
    setSearchValue('');
    const params = new URLSearchParams();
    if (category && category !== 'all') {
      params.set('category', category);
    }

    const qs = params.toString();
    const href = (qs ? `${pathname}?${qs}` : pathname) as '/news';

    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* Search Input */}
      <form action={newsPath} method="get" role="search" className="w-full">
        <label htmlFor="news-search" className="sr-only">
          {t('search')}
        </label>
        {category && category !== 'all' && <input type="hidden" name="category" value={category} />}
        <div className="glass flex overflow-hidden rounded-xl border border-border/60 transition-colors focus-within:border-brand-cyan/60 focus-within:ring-1 focus-within:ring-brand-cyan/40">
          <input
            id="news-search"
            name="q"
            type="search"
            maxLength={200}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={t('search')}
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
          />
          {searchValue && (
            <button
              type="button"
              onClick={handleClearQuery}
              aria-label={t('clearSearch')}
              className="px-2.5 text-white/40 hover:text-white transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
          <button
            type="submit"
            aria-label={t('search')}
            disabled={isPending}
            className="btn-glow inline-flex w-12 shrink-0 items-center justify-center bg-brand-cyan text-brand-navy transition-transform hover:brightness-110 active:scale-95 cursor-pointer"
          >
            <Search aria-hidden="true" className="size-4" strokeWidth={2.5} />
          </button>
        </div>
      </form>

      {/* Category Pills Strip */}
      <div
        role="tablist"
        aria-label={t('filterCategory')}
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs sm:text-sm"
      >
        {categories.map((cat) => {
          const isSelected =
            (cat.key === 'all' && (!category || category === 'all')) ||
            category.toLowerCase() === cat.key.toLowerCase();

          return (
            <button
              key={cat.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              disabled={isPending}
              onClick={() => handleCategorySelect(cat.key)}
              className={`shrink-0 rounded-full px-4 py-1.5 font-medium transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-brand-cyan text-brand-navy font-bold shadow-[0_0_14px_rgba(78,226,255,0.45)]'
                  : 'glass text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
