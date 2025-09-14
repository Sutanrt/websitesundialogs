// lib/ai/openers.ts
export const OPENERS = [
  '✅ Kamu sudah bagus — berikut revisinya:',
  '✅ Mantap! Ini versi yang lebih rapi:',
  '✅ Good job — ini perbaikan yang direkomendasikan:',
  '✅ Nice, aku poles sedikit ya:',
  '✅ Sudah oke! Ini penyempurnaannya:',
  '✅ Keren, ini versi lemesnya:',
  '✅ Sip! Berikut hasil perapihan:',
  '✅ Bagus banget — ini revisi ringannya:',
  '✅ Oke, ini versi yang lebih halus:',
  '✅ Siap, ini usulan revisi dariku:'
];
// lib/ai/openers.ts (lanjutan)
export function pickOpener(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return OPENERS[h % OPENERS.length];
}
