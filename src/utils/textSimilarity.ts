/**
 * Compute word-level Jaccard similarity between two strings.
 *
 * Both strings are lowercased, trimmed, and split on whitespace.
 * Returns |intersection| / |union| on a 0-1 scale.
 *  - 1 when both strings are empty (trivially identical)
 *  - 0 when exactly one string is empty
 */
export function wordJaccard(a: string, b: string): number {
  const wordsA = a.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const wordsB = b.toLowerCase().trim().split(/\s+/).filter(Boolean);

  const setA = new Set(wordsA);
  const setB = new Set(wordsB);

  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionSize = 0;
  for (const word of setA) {
    if (setB.has(word)) intersectionSize++;
  }

  const unionSize = new Set([...setA, ...setB]).size;
  return intersectionSize / unionSize;
}
