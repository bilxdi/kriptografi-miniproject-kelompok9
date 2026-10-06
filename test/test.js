// Tes otomatis algoritma. Jalankan: node test/test.js
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

// Muat file algoritma seperti di browser (fungsi jadi global)
const ctx = {};
vm.createContext(ctx);
for (const f of ['homofonik', 'caesar', 'transposisi']) {
  vm.runInContext(fs.readFileSync(`${__dirname}/../js/${f}.js`, 'utf8'), ctx);
}
const run = (kode) => vm.runInContext(kode, ctx);

// Contoh dari slide
assert.strictEqual(run("caesarEnkripsi('AWASI ASTERIX', 3)"), 'DZDVL DVWHULA');
assert.strictEqual(run("caesarEnkripsi('HELLO WORLD', 3)"), 'KHOOR ZRUOG');
assert.strictEqual(run("transposisiEnkripsi('DEPARTEMENTEKNIKINFORMATIKAITB', 'ABCDEF')"), 'DEKFIEMNOKPEIRAANKMIRTIATTENTB');
assert.deepStrictEqual([...run("urutanKolom('KRIPTO')")], [2, 0, 5, 3, 1, 4]);

// Tabel homofon tidak boleh punya pasangan dobel
const semua = run('Object.values(TABEL_HOMOFON).flat()');
assert.strictEqual(new Set(semua).size, semua.length, 'ada pasangan dobel');

// Enkripsi lalu dekripsi harus kembali sama (diulang karena homofon acak)
const contoh = ['SERANG SAAT FAJAR', 'KRIPTOGRAFI 2026!', 'A', ' SPASI DI AWAL DAN AKHIR '];
for (const p of contoh) {
  for (let i = 0; i < 50; i++) {
    const c = run(`transposisiEnkripsi(caesarEnkripsi(homofonikEnkripsi(${JSON.stringify(p)}), 7), 'UNSOED')`);
    const balik = run(`homofonikDekripsi(caesarDekripsi(transposisiDekripsi(${JSON.stringify(c)}, 'UNSOED'), 7))`);
    assert.strictEqual(balik, p);
  }
}
console.log('Semua tes lulus ✓');
