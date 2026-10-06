// ======================================================
// CIPHER TRANSPOSISI KOLOM
// Teks ditulis per baris ke tabel selebar kata kunci,
// lalu dibaca PER KOLOM sesuai urutan abjad huruf kunci.
// Tanpa huruf pengisi: baris terakhir boleh tidak penuh.
// ======================================================

// Urutan baca kolom. Contoh "KRIPTO" -> [2, 0, 5, 3, 1, 4]
// (kolom I dibaca pertama, lalu K, O, P, R, T).
// Kalau ada huruf kembar, kolom yang lebih kiri duluan.
function urutanKolom(kunci) {
  const indeks = [...kunci].map((_, i) => i);
  return indeks.sort((a, b) => {
    if (kunci[a] === kunci[b]) return a - b;
    return kunci[a] < kunci[b] ? -1 : 1;
  });
}

function transposisiEnkripsi(teks, kunci) {
  const unit = [...teks];
  const lebar = kunci.length;
  let hasil = '';
  for (const kol of urutanKolom(kunci)) {
    // ambil isi satu kolom: posisi kol, kol+lebar, kol+2*lebar, ...
    for (let i = kol; i < unit.length; i += lebar) hasil += unit[i];
  }
  return hasil;
}

function transposisiDekripsi(teks, kunci) {
  const unit = [...teks];
  const lebar = kunci.length;
  const jumlahBaris = Math.ceil(unit.length / lebar);
  const sisa = unit.length % lebar; // isi baris terakhir (0 = penuh)
  const hasil = [];
  let pos = 0;

  for (const kol of urutanKolom(kunci)) {
    // kolom di kanan sisa tidak kebagian baris terakhir
    const tinggi = sisa === 0 || kol < sisa ? jumlahBaris : jumlahBaris - 1;
    for (let b = 0; b < tinggi; b++) hasil[b * lebar + kol] = unit[pos++];
  }
  return hasil.join('');
}
