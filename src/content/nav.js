/**
 * The site's top-level destinations, as [path, translation key].
 *
 * Shared by the header and by the 404, which offers the same four routes as
 * the way out. Two hand-kept copies of this list would drift the moment a
 * section is added, and the copy on the 404 is the one nobody would notice.
 */
export const NAV_ITEMS = [
  ['/', 'work'],
  ['/lab', 'lab'],
  ['/about', 'about'],
  ['/cv', 'cv'],
]
