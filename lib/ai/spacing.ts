// lib/ai/spacing.ts

// ===== 0) daftar kata umum (boleh kamu tambah sendiri) =====
const BOUNDARY_WORDS = [
  // pronomina / kata hubung umum
  'abdi','anjeun','maneh','urang','simkuring','aing','salira',
  'mah','téh','teh','ogé','oge','pisan','sanes','sok','sareng','jeung',
  'ka','ke','ti','di','nu','anu','sanes','teu','moal','tos','geus','parantos',
  // verba/adjektiva sering muncul setelah subjek
  'resep','bogoh','bade','badé','nuju','indit','mulih','balik','hayang','heureuy',
  'lanceuk','raka','indung','ema',
  //lainnya
  'tuang','kalayak','lomba','pisan'
];

// ===== 1) deteksi "nyatu" agresif =====
export function isUnspaced(s: string) {
  const noWS = s.replace(/\s+/g, '');
  const spaces = s.length - noWS.length;
  if (noWS.length >= 4 && spaces === 0) return true;
  return noWS.length >= 12 && spaces <= Math.max(1, Math.floor(noWS.length / 50));
}

// ===== 2) sisipkan spasi sebelum kata umum jika nempel di tengah =====
// mis. "...abdiresep..." → "...abdi resep..."
function insertDictionaryBoundaries(raw: string) {
  let out = raw;
  // urutkan dari yang terpanjang biar gak “kegeser” kata pendeknya
  const words = [...BOUNDARY_WORDS].sort((a, b) => b.length - a.length);

  for (const w of words) {
    // tambah spasi di DEPAN kata w jika sebelumnya huruf (tanpa spasi)
    // gunakan unicode + lookbehind (Node 18+ OK)
    const re = new RegExp(`(?<=\\p{L})${w}`, 'giu');
    out = out.replace(re, ' $&');

    // opsional: kalau w diikuti huruf langsung, tambahkan spasi SESUDAH w
    // contoh "resepka" -> "resep ka"
    const re2 = new RegExp(`${w}(?=\\p{L})`, 'giu');
    out = out.replace(re2, '$& ');
  }

  // rapikan spasi ganda
  return out.replace(/\s{2,}/g, ' ').trim();
}

// ===== 3) pemecahan heuristik (fallback) =====
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
    if (!/[A-Za-zÀ-ÿ]/.test(t) || t.length <= max) { parts.push(t); continue; }

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

      const next = t[cut] || '';
      const prev = t[cut - 1] || '';
      if ((prev === 'n' || prev === 'N') && /[gyGY]/.test(next) && cut < i + max) cut++;

      parts.push(t.slice(i, cut));
      i = cut;
    }
  }

  return parts
    .join(' ')
    .replace(/\s+([,.!?;:])/g, '$1 ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ===== 4) guard utama: dictionary → heuristik kecil → heuristik normal =====
export function ensureReadableSpacing(s: string) {
  const trimmed = s.replace(/\s+/g, ' ').trim();

  // 1) Selalu coba pecah berbasis kamus dulu
  const dictFirst = insertDictionaryBoundaries(trimmed);

  // 2) Kalau sudah “kebaca”, cukup sampai sini
  if (!isUnspaced(dictFirst)) return dictFirst;

  // 3) Masih nyatu? Jatuhkan ke heuristik (pakai panjang hasil sekarang)
  const len = dictFirst.length;
  if (len <= 8)  return insertHeuristicSpaces(dictFirst, { target: 3, min: 2, max: 4 });
  if (len <= 20) return insertHeuristicSpaces(dictFirst, { target: 4, min: 2, max: 6 });
  return insertHeuristicSpaces(dictFirst, { target: 6, min: 3, max: 9 });
}

