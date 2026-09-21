import type { RichText } from '@sif/shared';

/**
 * Estimates reading time in minutes from plain text or Strapi rich text blocks.
 * Average reading speed: 200 words per minute.
 */
export function estimateReadingTime(content: string | RichText | null | undefined): number {
  if (!content) return 1;

  let text = '';
  if (typeof content === 'string') {
    text = content;
  } else if (Array.isArray(content)) {
    text = extractTextFromBlocks(content);
  }

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function extractTextFromBlocks(blocks: unknown[]): string {
  let result = '';
  for (const block of blocks) {
    if (typeof block === 'object' && block !== null) {
      const b = block as Record<string, unknown>;
      if (Array.isArray(b.children)) {
        for (const child of b.children) {
          if (typeof child === 'object' && child !== null && 'text' in child) {
            result += ' ' + String(child.text);
          }
        }
      }
    }
  }
  return result;
}
