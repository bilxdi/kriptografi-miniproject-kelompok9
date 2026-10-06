// ======================================================
// CIPHER SUBSTITUSI HOMOFONIK
// Setiap huruf diganti SALAH SATU pasangan huruf (homofon)
// yang dipilih acak. Huruf yang sering muncul punya lebih
// banyak homofon, jadi frekuensi huruf di cipherteks lebih rata.
// Tabel homofon = KUNCI (harus sama saat enkripsi & dekripsi).
// ======================================================

const ABJAD = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // dipakai juga di caesar.js

// Tabel dari slide Kriptografi Klasik 1 hlm. 25, SUDAH DIPERBAIKI:
// di slide ada 4 pasangan dobel (TF, JO, MS, FI) yang bikin dekripsi ambigu.
// Diganti: N: TF->QZ, L: JO->VW, T: MS->XK, X: FI->ZQ
const TABEL_HOMOFON = {
  A: ['BU', 'TX', 'YR', 'MB', 'OP', 'TF', 'QA'],
  B: ['ER', 'FY'],
  C: ['IU', 'CW', 'PL'],
  D: ['NQ', 'VT', 'OA', 'GP'],
  E: ['ZX', 'BR', 'JO', 'EW', 'HT', 'KC', 'ND', 'SO', 'BO', 'VE', 'KL', 'JU', 'HR'],
  F: ['EP', 'MS'],
  G: ['TW', 'HL'],
  H: ['OU', 'HE', 'JK', 'AT', 'KY', 'IQ'],
  I: ['GT', 'UA', 'CN', 'HI', 'WO', 'ZF', 'FI'],
  J: ['OC'],
  K: ['LV'],
  L: ['TY', 'VW', 'DR', 'ML'],
  M: ['GR', 'KU'],
  N: ['BE', 'QZ', 'XO', 'LG', 'PS', 'CD', 'IE'],
  O: ['YA', 'HU', 'VS', 'KP', 'BD', 'JZ', 'OL'],
  P: ['IR', 'JA'],
  Q: ['SP'],
  R: ['UL', 'XP', 'TA', 'RL', 'LW', 'DO'],
  S: ['EQ', 'IF', 'TK', 'PN', 'GL', 'TB'],
  T: ['SI', 'GD', 'KI', 'MA', 'EL', 'ET', 'XK', 'MT', 'TL'],
  U: ['FA', 'BI', 'SF'],
  V: ['GM'],
  W: ['TG', 'AS'],
  X: ['ZQ', 'TM'],
  Y: ['SR', 'DS'],
  Z: ['AR']
};

// Enkripsi: huruf -> homofon acak. Karakter selain A-Z (spasi, angka) tetap.
function homofonikEnkripsi(teks) {
  let hasil = '';
  for (const ch of teks) {
    const pilihan = TABEL_HOMOFON[ch];
    if (pilihan) hasil += pilihan[Math.floor(Math.random() * pilihan.length)];
    else hasil += ch;
  }
  return hasil;
}

// Dekripsi: baca 2 huruf sekaligus, cari pemiliknya di tabel.
function homofonikDekripsi(teks) {
  // Balik tabel: { BU: 'A', TX: 'A', ER: 'B', ... }
  const balik = {};
  for (const huruf in TABEL_HOMOFON) {
    for (const pasangan of TABEL_HOMOFON[huruf]) balik[pasangan] = huruf;
  }

  const unit = [...teks];
  let hasil = '';
  for (let i = 0; i < unit.length; i++) {
    if (ABJAD.includes(unit[i])) {
      const pasangan = unit[i] + (unit[i + 1] || '');
      if (!balik[pasangan]) throw new Error(`Pasangan "${pasangan}" tidak ada di tabel homofon`);
      hasil += balik[pasangan];
      i++; // lewati huruf kedua dari pasangan
    } else {
      hasil += unit[i];
    }
  }
  return hasil;
}
