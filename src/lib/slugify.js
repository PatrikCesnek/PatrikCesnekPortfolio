/**
 * Derive a URL slug from an entry title.
 * Slugs are identical across locales — the titles are proper nouns.
 */
export function slugify(title) {
  return String(title)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
