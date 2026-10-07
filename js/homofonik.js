// ======================================================
// CIPHER SUBSTITUSI HOMOFONIK
// Setiap huruf diganti SALAH SATU pasangan huruf (homofon)
// yang dipilih acak. Huruf yang sering muncul punya lebih
// banyak homofon, jadi frekuensi huruf di cipherteks lebih rata.
// Tabel homofon = KUNCI (harus sama saat enkripsi & dekripsi).
// ======================================================

let ABJAD = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // dipakai juga di caesar.js

// Tabel dari slide Kriptografi Klasik 1 hlm. 25, SUDAH DIPERBAIKI:
// di slide ada 4 pasangan dobel (TF, JO, MS, FI) yang bikin dekripsi ambigu.
// Diganti: N: TF->QZ, L: JO->VW, T: MS->XK, X: FI->ZQ
const TABEL_HOMOFON_LATIN = {
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

let TABEL_HOMOFON = { ...TABEL_HOMOFON_LATIN };

function setAlfabet(abjadBaru) {
  const unik = [...new Set([...abjadBaru.toUpperCase()])].filter(c => c.trim());
  if (unik.length < 2) throw new Error("Alfabet minimal 2 karakter.");
  ABJAD = unik.join('');
  
  if (ABJAD === 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    TABEL_HOMOFON = { ...TABEL_HOMOFON_LATIN };
  } else {
    // Buat tabel acak untuk alfabet baru
    const pasangan = [];
    for (const a of ABJAD) {
      for (const b of ABJAD) {
        pasangan.push(a + b);
      }
    }
    pasangan.sort(() => Math.random() - 0.5); // acak
    
    TABEL_HOMOFON = {};
    let pos = 0;
    // Beri 2 atau 3 pasangan untuk tiap huruf (agar UI tidak terlalu panjang)
    const jatah = Math.min(3, Math.max(1, Math.floor(pasangan.length / ABJAD.length)));
    for (const huruf of ABJAD) {
      TABEL_HOMOFON[huruf] = pasangan.slice(pos, pos + jatah);
      pos += jatah;
    }
  }
}

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

// Update tabel homofon dari input user, dan cek apakah ada homofon yang dobel
function updateTabelHomofon(newTabel) {
  const seen = new Set();
  for (const huruf in newTabel) {
    for (const pasangan of newTabel[huruf]) {
      if (pasangan.length !== 2) {
        throw new Error(`Homofon "${pasangan}" tidak valid. Setiap homofon harus terdiri dari tepat 2 huruf.`);
      }
      if (seen.has(pasangan)) {
        throw new Error(`Pasangan "${pasangan}" dipakai lebih dari satu kali! Tidak boleh ada homofon yang double.`);
      }
      seen.add(pasangan);
    }
  }
  TABEL_HOMOFON = newTabel;
}
