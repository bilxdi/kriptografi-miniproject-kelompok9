// ======================================================
// APP.JS: menghubungkan tampilan (HTML) dengan algoritma.
// Alur enkripsi : Homofonik -> Caesar -> Transposisi Kolom
// Alur dekripsi : kebalikannya (Transposisi -> Caesar -> Homofonik)
// ======================================================

const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

function uraiHangul(str) {
  let res = '';
  for(let i=0; i<str.length; i++) {
    const code = str.charCodeAt(i) - 44032;
    if(code >= 0 && code <= 11171) {
      res += CHO[Math.floor(code/588)] + JUNG[Math.floor((code%588)/28)] + (code%28 ? JONG[code%28] : '');
    } else res += str[i];
  }
  return res;
}

function rakitHangul(str) {
  let res = '';
  let i = 0;
  while (i < str.length) {
    const c1 = CHO.indexOf(str[i]);
    if (c1 !== -1 && i + 1 < str.length) {
      const c2 = JUNG.indexOf(str[i+1]);
      if (c2 !== -1) {
        let c3 = 0;
        if (i + 2 < str.length) {
          const nextJong = JONG.indexOf(str[i+2]);
          if (nextJong > 0 && !(i + 3 < str.length && JUNG.indexOf(str[i+3]) !== -1)) {
            c3 = nextJong;
            res += String.fromCharCode(44032 + (c1 * 588) + (c2 * 28) + c3);
            i += 3; continue;
          }
        }
        res += String.fromCharCode(44032 + (c1 * 588) + (c2 * 28));
        i += 2; continue;
      }
    }
    res += str[i];
    i++;
  }
  return res;
}

const $ = (id) => document.getElementById(id);
let terakhir = null; // data enkripsi terakhir, dipakai di "Cara Kerja"
let episodeAktif = 0;

// ---------- 1. Ambil & cek kunci ----------
function ambilKunci() {
  const k = parseInt($('kunciCaesar').value, 10);
  const kolomInput = uraiHangul($('kunciKolom').value.toUpperCase());
  const kolom = [...kolomInput].filter(c => ABJAD.includes(c)).join('');
  if (Number.isNaN(k)) throw new Error('Kunci Caesar harus angka.');
  if (kolom.length < 2) throw new Error('Kunci transposisi minimal 2 huruf dari alfabet.');
  return { k, kolom };
}

// ---------- 2. Proses 3 tahap ----------
function enkripsi(plain, kunci) {
  const t1 = homofonikEnkripsi(plain);
  const t2 = caesarEnkripsi(t1, kunci.k);
  const t3 = transposisiEnkripsi(t2, kunci.kolom);
  return { plain, t1, t2, t3, ...kunci };
}

function dekripsi(cipher, kunci) {
  const t1 = transposisiDekripsi(cipher, kunci.kolom);
  const t2 = caesarDekripsi(t1, kunci.k);
  const plain = homofonikDekripsi(t2);
  return { t1, t2, plain };
}

// ---------- 3. Tampilkan hasil ----------
function tampilkanHasil(tahap, labelAkhir, teksAkhir) {
  $('daftarTahap').innerHTML = tahap
    .map(([judul, isi]) => `<li><span class="label">${judul}</span><span class="mono">${isi}</span></li>`)
    .join('');
  $('labelAkhir').textContent = labelAkhir;
  $('teksAkhir').textContent = teksAkhir;
  $('hasil').hidden = false;
}

function jalankan(fungsi) {
  $('pesanError').textContent = '';
  try {
    fungsi();
  } catch (err) {
    $('pesanError').textContent = err.message;
  }
}

$('tombolEnkripsi').onclick = () => jalankan(() => {
  const plain = uraiHangul($('inputPlain').value.toUpperCase());
  if (!plain.trim()) throw new Error('Plainteks masih kosong.');

  terakhir = enkripsi(plain, ambilKunci());
  const finalCipher = rakitHangul(terakhir.t3);
  tampilkanHasil([
    ['TAHAP 1 · HOMOFONIK', terakhir.t1],
    ['TAHAP 2 · CAESAR (k = ' + terakhir.k + ')', terakhir.t2],
    ['TAHAP 3 · TRANSPOSISI KOLOM (' + terakhir.kolom + ')', terakhir.t3]
  ], 'CIPHERTEKS', finalCipher);

  // Validasi: dekripsi lagi, harus sama persis dengan plainteks
  const cek = dekripsi(uraiHangul(finalCipher), terakhir).plain;
  $('validasi').className = 'validasi ' + (cek === plain ? 'ok' : 'gagal');
  $('validasi').textContent = cek === plain
    ? '✓ Valid: hasil dekripsi identik dengan plainteks awal'
    : '✗ Tidak valid: hasil dekripsi berbeda';

  $('inputCipher').value = finalCipher; // siap dicoba di tab Dekripsi
  tampilkanEpisode(0);
});

$('tombolDekripsi').onclick = () => jalankan(() => {
  // jangan di-trim: spasi di awal/akhir bisa jadi bagian cipherteks
  const cipher = uraiHangul($('inputCipher').value.toUpperCase());
  if (!cipher.trim()) throw new Error('Cipherteks masih kosong.');

  const d = dekripsi(cipher, ambilKunci());
  const finalPlain = rakitHangul(d.plain);
  tampilkanHasil([
    ['TAHAP 1 · BALIK TRANSPOSISI KOLOM', d.t1],
    ['TAHAP 2 · BALIK CAESAR', d.t2],
    ['TAHAP 3 · BALIK HOMOFONIK', d.plain]
  ], 'PLAINTEKS', finalPlain);
  $('validasi').textContent = '';
});

// ---------- 4. Tab, salin, unduh, upload ----------
document.querySelectorAll('.tab-btn').forEach((tombol) => {
  tombol.onclick = () => {
    document.querySelectorAll('.tab-btn').forEach((t) => t.classList.remove('aktif'));
    tombol.classList.add('aktif');
    $('panelEnkripsi').hidden = tombol.dataset.panel !== 'panelEnkripsi';
    $('panelDekripsi').hidden = tombol.dataset.panel !== 'panelDekripsi';
  };
});

$('tombolSalin').onclick = () => navigator.clipboard.writeText($('teksAkhir').textContent);

$('tombolUnduh').onclick = () => {
  const file = new Blob([$('teksAkhir').textContent], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = $('labelAkhir').textContent.toLowerCase() + '.txt';
  link.click();
};

function bacaFile(inputFile, textarea) {
  inputFile.onchange = () => {
    const pembaca = new FileReader();
    pembaca.onload = () => (textarea.value = pembaca.result.replace(/\r?\n$/, '')); // buang enter terakhir
    pembaca.readAsText(inputFile.files[0]);
  };
}
bacaFile($('filePlain'), $('inputPlain'));
bacaFile($('fileCipher'), $('inputCipher'));

// ---------- 5. Cara Kerja (episode) ----------
const EPISODE = [
  { judul: 'Homofonik', ket: 'Huruf jadi pasangan huruf acak' },
  { judul: 'Caesar', ket: 'Setiap huruf digeser k' },
  { judul: 'Transposisi Kolom', ket: 'Posisi huruf diacak per kolom' },
  { judul: 'Validasi', ket: 'Dekripsi balik & bandingkan' }
];

$('daftarEpisode').innerHTML = EPISODE.map((e, i) =>
  `<button class="episode" data-i="${i}"><span class="nomor">${i + 1}</span>
   <strong>${e.judul}</strong><small>${e.ket}</small></button>`).join('');
document.querySelectorAll('.episode').forEach((ep) => (ep.onclick = () => tampilkanEpisode(+ep.dataset.i)));

function tabel(kepala, baris) {
  return `<div class="tabel-wrap"><table class="tabel"><tr>${kepala.map((k) => `<th>${k}</th>`).join('')}</tr>
    ${baris.map((b) => `<tr>${b.map((sel) => `<td>${sel}</td>`).join('')}</tr>`).join('')}</table></div>`;
}

// Isi layar untuk tiap episode (maks. 8 huruf pertama biar ringkas)
function isiEpisode(i, d) {

  if (i === 0) {
    // cari homofon yang terpilih untuk tiap huruf
    const unit = [...d.t1];
    let pos = 0;
    const baris = [];
    for (const ch of d.plain) {
      if (TABEL_HOMOFON[ch]) {
        if (baris.length < 8) baris.push([ch, TABEL_HOMOFON[ch].join(', '), `<b>${unit[pos] + unit[pos + 1]}</b>`]);
        pos += 2;
      } else pos += 1;
    }
    return `<p>Setiap huruf diganti <b>salah satu</b> homofonnya secara acak. Karena acak,
      mengenkripsi pesan yang sama bisa menghasilkan cipherteks berbeda.</p>
      ${tabel(['HURUF', 'PILIHAN HOMOFON', 'TERPILIH'], baris)}
      <p class="mono">${d.plain} → ${d.t1}</p>`;
  }

  if (i === 1) {
    const baris = [...d.t1].filter((ch) => ABJAD.includes(ch)).slice(0, 8).map((ch) => {
      const p = ABJAD.indexOf(ch);
      const c = mod(p + d.k, ABJAD.length);
      return [ch, p, `(${p} + ${d.k}) mod ${ABJAD.length} = ${c}`, `<b>${ABJAD[c]}</b>`];
    });
    return `<p>Huruf diubah ke angka (0 … ${ABJAD.length - 1}), lalu dihitung
      <span class="rumus mono">c = (p + k) mod ${ABJAD.length}</span></p>
      ${tabel(['HURUF', 'p', 'HITUNG', 'HASIL'], baris)}
      <p class="mono">${d.t1} → ${d.t2}</p>`;
  }

  if (i === 2) {
    const urutan = urutanKolom(d.kolom);
    const nomor = [...d.kolom].map((_, kol) => `<span class="urutan">${urutan.indexOf(kol) + 1}</span>`);
    const baris = [];
    for (let b = 0; b < d.t2.length; b += d.kolom.length) baris.push([...d.t2.slice(b, b + d.kolom.length)]);
    return `<p>Hasil tahap 2 ditulis per baris ke tabel selebar kunci <b>${d.kolom}</b>.
      Angka merah = urutan kolom dibaca (urut abjad huruf kunci). Kolom dibaca dari atas ke bawah.</p>
      <div class="tabel-wrap"><table class="tabel grid-transposisi">
        <tr>${nomor.map((n) => `<th>${n}</th>`).join('')}</tr>
        <tr>${[...d.kolom].map((h) => `<th>${h}</th>`).join('')}</tr>
        ${baris.map((b) => `<tr>${b.map((sel) => `<td>${sel === ' ' ? '␣' : sel}</td>`).join('')}</tr>`).join('')}
      </table></div>
      <p class="mono">Cipherteks: ${d.t3}</p>`;
  }

  const balik = dekripsi(d.t3, d);
  const ok = balik.plain === d.plain;
  return `<p>Cipherteks didekripsi dengan urutan terbalik, lalu dibandingkan dengan plainteks awal.</p>
    ${tabel(['LANGKAH', 'HASIL'], [
      ['Balik transposisi', balik.t1],
      ['Balik Caesar (−' + d.k + ')', balik.t2],
      ['Balik homofonik', balik.plain]
    ])}
    <p class="validasi ${ok ? 'ok' : 'gagal'}">${ok ? '✓ Identik dengan plainteks awal' : '✗ Berbeda'}</p>`;
}

function tampilkanEpisode(i) {
  episodeAktif = i;
  document.querySelectorAll('.episode').forEach((ep, j) => {
    ep.classList.toggle('aktif', j === i);
    ep.classList.toggle('selesai', j < i);
  });
  $('layar').innerHTML = terakhir
    ? `<h3>Episode ${i + 1} · ${EPISODE[i].judul}</h3>${isiEpisode(i, terakhir)}`
    : '<p class="sub">Enkripsi sebuah pesan dulu, lalu penjelasannya muncul di sini.</p>';
}

$('tombolLanjut').onclick = () => tampilkanEpisode(Math.min(episodeAktif + 1, 3));
$('tombolSebelum').onclick = () => tampilkanEpisode(Math.max(episodeAktif - 1, 0));

// ---------- 6. Kriptanalisis: brute force kunci Caesar ----------
$('tombolBrute').onclick = () => jalankan(() => {
  const cipher = uraiHangul($('inputCipher').value.toUpperCase());
  if (!cipher.trim()) throw new Error('Isi cipherteks dulu (enkripsi atau isi di tab Dekripsi).');
  const { kolom } = ambilKunci();

  const baris = [];
  for (let k = 0; k < ABJAD.length; k++) {
    let hasil;
    try {
      hasil = homofonikDekripsi(caesarDekripsi(transposisiDekripsi(cipher, kolom), k));
    } catch {
      hasil = null; // ada pasangan yang tidak ada di tabel -> k pasti salah
    }
    baris.push(`<tr class="${hasil ? 'benar' : ''}"><td>${k}</td><td>${hasil ? '✓ ' + hasil : 'gagal: pasangan tidak ada di tabel'}</td></tr>`);
  }
  $('tabelBrute').innerHTML = '<tr><th>k</th><th>HASIL DEKRIPSI</th></tr>' + baris.join('');
});

function gantiBahasa(teks) {
  $('inputAbjad').value = teks;
  $('inputAbjad').dispatchEvent(new Event('change'));
}

$('inputAbjad').onchange = () => jalankan(() => {
  setAlfabet($('inputAbjad').value.toUpperCase());
  renderTabelHomofon();
});

// ---------- 7. Dialog tabel homofon ----------
function renderTabelHomofon() {
  $('isiTabel').innerHTML = Object.entries(TABEL_HOMOFON).map(([huruf, daftar]) =>
    `<div class="homofon-item" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
      <label style="width: 20px;"><b>${huruf}</b></label>
      <input type="text" id="homofon-${huruf}" value="${daftar.join(' ')}" class="input-homofon" style="flex: 1; padding: 0.25rem;">
    </div>`
  ).join('');
}

renderTabelHomofon();

$('tombolTabel').onclick = () => {
  renderTabelHomofon();
  $('errorHomofon').textContent = '';
  $('dialogTabel').showModal();
};

$('tombolTutupTabel').onclick = () => $('dialogTabel').close();

$('formHomofon').onsubmit = (e) => {
  e.preventDefault();
  $('errorHomofon').textContent = '';
  
  // Reset style
  document.querySelectorAll('.input-homofon').forEach(el => {
    el.style.color = '';
    el.style.borderColor = '';
  });

  try {
    const newTable = {};
    const seen = new Set();
    let duplicate = null;
    let invalidLength = null;

    for (const huruf of ABJAD) {
      const inputVal = $(`homofon-${huruf}`).value.toUpperCase().trim();
      if (!inputVal) throw new Error(`Huruf ${huruf} harus punya minimal 1 homofon.`);
      const pairs = inputVal.split(/[\s,]+/).filter(Boolean);
      newTable[huruf] = pairs;

      for (const pasangan of pairs) {
        if (pasangan.length !== 2) {
          invalidLength = { huruf, pasangan };
        }
        if (seen.has(pasangan) && !duplicate) {
          duplicate = pasangan;
        }
        seen.add(pasangan);
      }
    }

    if (invalidLength) {
      $(`homofon-${invalidLength.huruf}`).style.borderColor = 'red';
      throw new Error(`Homofon "${invalidLength.pasangan}" tidak valid. Setiap homofon harus terdiri dari tepat 2 huruf.`);
    }

    if (duplicate) {
      // Highlight semua input yang mengandung homofon duplikat
      for (const huruf of ABJAD) {
        if (newTable[huruf].includes(duplicate)) {
          $(`homofon-${huruf}`).style.color = 'red';
          $(`homofon-${huruf}`).style.borderColor = 'red';
        }
      }
      throw new Error(`Pasangan "${duplicate}" dipakai lebih dari satu kali! Tidak boleh ada homofon yang double.`);
    }

    updateTabelHomofon(newTable);
    $('dialogTabel').close();
  } catch (err) {
    $('errorHomofon').textContent = err.message;
  }
};

// ---------- 8. Mode gelap / terang ----------
function aturTema(tema) {
  document.documentElement.dataset.theme = tema;
  $('tombolTema').textContent = tema === 'gelap' ? 'Mode terang' : 'Mode gelap';
  try { localStorage.setItem('tema', tema); } catch { /* abaikan */ }
}
$('tombolTema').onclick = () => aturTema(document.documentElement.dataset.theme === 'gelap' ? 'terang' : 'gelap');
try { aturTema(localStorage.getItem('tema') || 'gelap'); } catch { aturTema('gelap'); }

tampilkanEpisode(0);
