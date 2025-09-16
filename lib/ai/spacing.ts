// lib/ai/spacing.ts

// 1) Deteksi "nyatu" lebih agresif: 4+ huruf TANPA spasi dianggap nyatu.
export function isUnspaced(s: string) {
  const noWS = s.replace(/\s+/g, '');
  const spaces = s.length - noWS.length;

  // 4+ huruf tanpa spasi → pasti nyatu
  if (noWS.length >= 4 && spaces === 0) return true;

  // fallback untuk teks panjang: rasio spasi sangat kecil
  return noWS.length >= 18 && spaces <= Math.max(1, Math.floor(noWS.length / 50));
}

/** 2) Sisipi spasi heuristik pada teks nyatu */
export function insertHeuristicSpaces(
  raw: string,
  cfg: { target?: number; min?: number; max?: number } = {}
) {
  const target = cfg.target ?? 6; // default (teks panjang) — dipakai kalau tidak dioverride
  const min = cfg.min ?? 3;
  const max = cfg.max ?? 9;

  const vowels = /[aeiouAEIOUéÉ]/;

  // Kelompokkan huruf/angka vs tanda baca agar yang non-huruf tidak dipecah
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

      // cari titik pecah yang enak: vokal terdekat dalam window [min..max]
      let cut = -1;
      const upper = Math.min(i + max, i + target + 2);
      for (let j = upper; j >= i + min; j--) {
        if (vowels.test(t[j - 1])) { cut = j; break; }
      }
      if (cut === -1) cut = i + target;

      // hindari putus "n|N" tepat sebelum g/y (ng/ny)
      const next = t[cut] || '';
      const prev = t[cut - 1] || '';
      if ((prev === 'n' || prev === 'N') && /[gyGY]/.test(next) && cut < i + max) {
        cut++;
      }

      parts.push(t.slice(i, cut));
      i = cut;
    }
  }

  return parts
    .join(' ')
    .replace(/\s+([,.!?;:])/g, '$1 ') // spasi setelah tanda baca
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** 3) Guard utama: adaptif — untuk teks pendek pakai blok lebih kecil (2–4 huruf) */
export function ensureReadableSpacing(s: string) {
  const trimmed = s.replace(/\s+/g, ' ').trim();
  if (!isUnspaced(trimmed)) return trimmed;

  const len = trimmed.length;
  // ≤8 huruf: blok 2–4, supaya "tadigalga" → "tadi galga" (lebih kebaca)
  if (len <= 8) return insertHeuristicSpaces(trimmed, { target: 3, min: 2, max: 4 });
  // ≤20 huruf: blok 2–6
  if (len <= 20) return insertHeuristicSpaces(trimmed, { target: 4, min: 2, max: 6 });
  // sisanya: default (3–9)
  return insertHeuristicSpaces(trimmed, { target: 6, min: 3, max: 9 });
}
