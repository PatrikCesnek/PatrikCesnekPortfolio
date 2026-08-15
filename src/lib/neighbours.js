/**
 * Prev is older (index - 1), next is newer (index + 1); both wrap.
 *
 * The handoff's interaction table says "prev = older, i.e. index + 1". In its
 * own oldest-first DATA, index + 1 is newer, so the two halves contradict.
 * The semantic half wins, and it matches the handoff's own rendered example —
 * "← Matee" on the left is older, "SideQ →" on the right is newer.
 */
export function neighbours(index, length) {
  return {
    prev: (index - 1 + length) % length,
    next: (index + 1) % length,
  }
}
