'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/container';

export interface MediaTab {
  /** Also the URL hash, so a tab is linkable: /media#media-kit. */
  key: string;
  label: string;
  panel: ReactNode;
}

/**
 * The Media Center's own topbar: four tabs under the site header.
 *
 * Every panel is rendered into the HTML and the inactive ones are hidden with
 * the `hidden` attribute rather than unmounted. That is the point of a press
 * room — a journalist searching the page for a release, and a crawler indexing
 * it, both find the content without having to click through four tabs first.
 *
 * State lives in the URL hash rather than a search param: a hash needs no
 * Suspense boundary (`useSearchParams` opts the whole page into client-side
 * rendering), survives a reload, and can be pasted into an email to a
 * journalist — "the assets are at /media#media-kit".
 */
export function MediaTabs({ tabs, label }: { tabs: MediaTab[]; label: string }) {
  const [active, setActive] = useState(tabs[0]?.key);

  useEffect(() => {
    const fromHash = () => {
      const hash = window.location.hash.slice(1);
      if (tabs.some((tab) => tab.key === hash)) setActive(hash);
    };

    fromHash(); // Deep link on first paint.
    // Back/forward between tabs, and hash links from elsewhere on the site.
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [tabs]);

  const select = (key: string) => {
    setActive(key);
    // replaceState, not a hash assignment: assigning `location.hash` makes the
    // browser jump the anchor to the top of the viewport, under the sticky
    // header, and pushes an entry per tab click onto the history stack.
    window.history.replaceState(null, '', `#${key}`);
  };

  return (
    <>
      {/*
        Sticky directly beneath the site header, which is h-16 / sm:h-20 on
        every page but the homepage. The two bars then read as one piece of
        chrome instead of the tabs sliding under the nav.
      */}
      <div className="border-border bg-background/85 sticky top-16 z-40 border-b backdrop-blur sm:top-20">
        <Container>
          <div
            role="tablist"
            aria-label={label}
            // The four labels do not fit a phone, so the strip scrolls
            // horizontally. Negative margin lets the scroll run edge to edge
            // while the first tab still lines up with the page gutter.
            className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {tabs.map((tab) => {
              const selected = tab.key === active;

              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  id={`tab-${tab.key}`}
                  aria-selected={selected}
                  aria-controls={`panel-${tab.key}`}
                  onClick={() => select(tab.key)}
                  className={cn(
                    'relative shrink-0 px-4 py-4 text-sm font-semibold whitespace-nowrap transition-colors sm:px-5',
                    selected
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground cursor-pointer',
                  )}
                >
                  {tab.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-x-2 bottom-0 h-0.5 rounded-full transition-opacity',
                      selected
                        ? 'from-accent to-primary bg-gradient-to-r opacity-100'
                        : 'opacity-0',
                    )}
                  />
                </button>
              );
            })}
          </div>
        </Container>
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.key}
          role="tabpanel"
          id={`panel-${tab.key}`}
          aria-labelledby={`tab-${tab.key}`}
          hidden={tab.key !== active}
          tabIndex={0}
        >
          {tab.panel}
        </div>
      ))}
    </>
  );
}
