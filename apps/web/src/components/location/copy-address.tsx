'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { Check, Copy } from 'lucide-react';

/** The support check reads a browser API once and never changes afterwards. */
const noSubscribe = () => () => undefined;

/**
 * Copy-to-clipboard for the venue address.
 *
 * Worth the client bundle on this page specifically: most visitors arrive by
 * ride-hailing app, and the action they actually take on a venue page is
 * "copy this into Grab", not "read it".
 *
 * Renders nothing on the server or where `navigator.clipboard` is missing (it
 * is absent over plain HTTP) — a button that silently does nothing is worse
 * than no button. The check goes through `useSyncExternalStore` rather than an
 * effect so the server snapshot is `false` and the client's first paint is
 * already correct, with no cascading render.
 */
export function CopyAddress({
  value,
  label,
  copiedLabel,
}: {
  value: string;
  label: string;
  copiedLabel: string;
}) {
  const available = useSyncExternalStore(
    noSubscribe,
    () => typeof navigator !== 'undefined' && !!navigator.clipboard,
    () => false,
  );
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  if (!available || failed) return null;

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value).then(
          () => setCopied(true),
          // A rejected write means the permission was denied; hide rather than
          // leave a button that looks live and is not.
          () => setFailed(true),
        );
      }}
      className="text-brand-cyan inline-flex items-center gap-2 text-sm font-semibold hover:underline"
    >
      {copied ? (
        <Check aria-hidden="true" className="size-4" />
      ) : (
        <Copy aria-hidden="true" className="size-4" />
      )}
      {/* Announced on change: the icon swap alone is invisible to a screen
          reader, and the label is the only signal the copy succeeded. */}
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
