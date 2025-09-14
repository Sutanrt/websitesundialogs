// lib/ai/spacing.ts

// Deteksi apakah string "nyatu" (hampir tanpa spasi)
export function isUnspaced(s: string) {
  const onlyText = s.replace(/\s+/g, "");
  const spaces = (s.match(/\s/g) || []).length;
  if (onlyText.length < 24) return false;
  return spaces <= Math.max(1, Math.floor(onlyText.length / 40));
}

/** Sisipi spasi heuristik pada teks nyatu */
export function insertHeuristicSpaces(
  raw: string,
  cfg: { target?: number; min?: number; max?: number } = {}
) {
  const target = cfg.target ?? 6;
  const min = cfg.min ?? 3;
  const max = cfg.max ?? 9;
  const vowels = /[aeiouAEIOUéÉ]/;

  const tokens = [...raw.matchAll(/[A-Za-zÀ-ÿ]+|\d+|[^\w\s]+/g)].map(m => m[0]);
  const parts: string[] = [];

  for (const t of tokens) {
    if (!/[A-Za-zÀ-ÿ]/.test(t) || t.length <= max) {
      parts.push(t);
      continue;
    }
    let i = 0;
    while (i < t.length) {
      const remain = t.length - i;
      if (remain <= max) { parts.push(t.slice(i)); break; }

      let cut = -1;
      const upper = Math.min(i + max, i + target + 2);
      for (let j = upper; j >= i + min; j--) {
        if (vowels.test(t[j - 1])) { cut = j; break; }
      }
      if (cut === -1) cut = i + target;

      const next = t[cut] || "";
      const prev = t[cut - 1] || "";
      if ((prev === "n" || prev === "N") && /[gyGY]/.test(next) && cut < i + max) {
        cut++;
      }
      parts.push(t.slice(i, cut));
      i = cut;
    }
  }

  return parts
    .join(" ")
    .replace(/\s+([,.!?;:])/g, "$1 ") // spasi setelah tanda baca
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Guard utama: kalau nyatu → rapikan; kalau normal → balikin apa adanya */
export function ensureReadableSpacing(s: string) {
  const trimmed = s.replace(/\s+/g, " ").trim();
  return isUnspaced(trimmed) ? insertHeuristicSpaces(trimmed) : trimmed;
}
