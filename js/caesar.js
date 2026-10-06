// ======================================================
// CAESAR CIPHER
// Setiap huruf digeser sejauh k. Huruf diubah ke angka A=0 ... Z=25.
//   Enkripsi : c = (p + k) mod 26
//   Dekripsi : p = (c - k) mod 26
// ======================================================

// mod yang selalu positif. Di JavaScript -3 % 26 = -3,
// padahal secara matematika -3 mod 26 = 23.
function mod(a, n) {
  return ((a % n) + n) % n;
}

function caesarEnkripsi(teks, k) {
  let hasil = '';
  for (const ch of teks) {
    const p = ABJAD.indexOf(ch); // posisi huruf, -1 kalau bukan huruf
    hasil += p === -1 ? ch : ABJAD[mod(p + k, 26)];
  }
  return hasil;
}

// Dekripsi = enkripsi dengan geseran ke arah sebaliknya
function caesarDekripsi(teks, k) {
  return caesarEnkripsi(teks, -k);
}
