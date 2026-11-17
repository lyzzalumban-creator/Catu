/*
 * Daftar uji. Tiap uji adalah fungsi yang dijalankan DI DALAM halaman aplikasi,
 * jadi bisa memakai fungsi global penniq (evalExpr, effect, recalc, gestCalc, ...)
 * serta pembantu eq/ok/fresh/tx/net dari run.js. Jangan memakai variabel luar fungsi.
 * Hari ini dikunci: 17 Nov 2026.
 */
const cases = [];
const t = (name, fn) => cases.push([name, fn]);

/* ============ kalkulator ============ */
t('kalkulator: urutan operasi', () => {
  eq(evalExpr('2+3×4'), 14);
  eq(evalExpr('10-2-3'), 5);
  eq(evalExpr('12÷4'), 3);
  eq(evalExpr('1000000×3÷100'), 30000);
});
t('kalkulator: tepi (kosong, operator menggantung, bagi nol, pembulatan)', () => {
  eq(evalExpr(''), 0);
  eq(evalExpr('5+'), 5);
  eq(evalExpr('5÷0'), 0);
  eq(evalExpr('7÷2'), 4);
});
t('kalkulator: pressKey angka dan nol depan', () => {
  const o = { expr: '' };
  pressKey(o, '1'); pressKey(o, '2'); eq(o.expr, '12');
  const p = { expr: '' };
  pressKey(p, '0'); pressKey(p, '5'); eq(p.expr, '5', 'nol depan diganti');
  const q = { expr: '' };
  pressKey(q, '000'); eq(q.expr, '', '000 di awal diabaikan');
});
t('kalkulator: batas 12 digit dan operator', () => {
  const o = { expr: '123456789012' };
  pressKey(o, '3'); eq(o.expr, '123456789012', 'digit ke-13 ditolak');
  const p = { expr: '' };
  pressKey(p, '+'); eq(p.expr, '', 'operator di awal ditolak');
  const q = { expr: '5+' };
  pressKey(q, '×'); eq(q.expr, '5×', 'operator menggantikan operator');
});
t('kalkulator: tombol = dan hapus', () => {
  const o = { expr: '2+3' };
  pressKey(o, '='); eq(o.expr, '5');
  const p = { expr: '3-5' };
  pressKey(p, '='); eq(p.expr, '', 'hasil <= 0 dikosongkan');
  const q = { expr: '123' };
  pressKey(q, 'bs'); eq(q.expr, '12');
  pressKey(q, 'c'); eq(q.expr, '');
});

/* ============ format uang ============ */
t('format: rp() dan minus', () => {
  eq(rp(1500000), 'Rp 1.500.000');
  eq(rp(-2500), '−Rp 2.500');
  eq(rp(0), 'Rp 0');
  eq(rp(0.6), 'Rp 1');
});
t('format: mode privasi menyembunyikan nominal', () => {
  fresh(); S.settings.privacy = true;
  eq(money(123456), 'Rp ••••••');
  S.settings.privacy = false;
  eq(money(123456), 'Rp 123.456');
});

/* ============ saldo dan utang ============ */
t('saldo: pengeluaran dompet mengurangi saldo', () => {
  fresh({ tx: [tx({ t: 'exp', acc: 'w1', amt: 250000, cat: 'k1' })] }); recalc();
  eq(D.bal.w1, 750000);
});
t('saldo: pengeluaran lewat kartu menambah tagihan, bukan saldo', () => {
  fresh({ tx: [tx({ t: 'exp', acc: 'c1', amt: 300000, cat: 'k1' })] }); recalc();
  eq(D.debt.c1, 300000); eq(D.bal.w1, 1000000);
});
t('saldo: pemasukan menambah saldo', () => {
  fresh({ tx: [tx({ t: 'inc', acc: 'w2', amt: 2000000, cat: 'k2' })] }); recalc();
  eq(D.bal.w2, 2500000);
});
t('saldo: transfer memindahkan uang, total tetap', () => {
  fresh({ tx: [tx({ t: 'xfer', acc: 'w1', to: 'w2', amt: 400000 })] }); recalc();
  eq(D.bal.w1, 600000); eq(D.bal.w2, 900000); eq(net(), 1500000);
});
t('saldo: bayar kartu mengurangi dompet dan tagihan', () => {
  fresh({ tx: [tx({ t: 'exp', acc: 'c1', amt: 500000, cat: 'k1' }), tx({ t: 'pay', acc: 'w1', to: 'c1', amt: 200000 })] }); recalc();
  eq(D.debt.c1, 300000); eq(D.bal.w1, 800000);
  eq(net(), 1000000, 'bayar kartu hanya memindahkan uang: 1,5 jt - pengeluaran kartu 0,5 jt');
});
t('saldo: akun tak dikenal diabaikan, tidak ada NaN', () => {
  fresh({ tx: [tx({ t: 'exp', acc: 'hantu', amt: 1000 }), tx({ t: 'xfer', acc: 'w1', to: 'hantu', amt: 1000 })] }); recalc();
  ok(Object.values(D.bal).every(Number.isFinite), 'saldo harus angka');
  eq(D.bal.w2, 500000);
});
t('saldo: effect dengan tanda -1 membatalkan efek', () => {
  fresh(); recalc();
  const o = { bal: { w1: 1000, w2: 0 }, debt: { c1: 0 } };
  const x = tx({ t: 'xfer', acc: 'w1', to: 'w2', amt: 300 });
  effect(x, o.bal, o.debt, 1); effect(x, o.bal, o.debt, -1);
  eq(o.bal, { w1: 1000, w2: 0 });
});

/* ============ gestun ============ */
t('gestun: skema A (potong cair) persen', () => {
  fresh(); ui.gest = { card: 'c1', wallet: 'w1', feeMode: 'pct', feeVal: '3', scheme: 'A', date: '2026-11-17' };
  ui.amt = { expr: '1000000' };
  eq(gestCalc(), { nom: 1000000, fee: 30000, cardAmt: 1000000, inAmt: 970000 });
});
t('gestun: skema B (terima bersih) persen', () => {
  fresh(); ui.gest = { card: 'c1', wallet: 'w1', feeMode: 'pct', feeVal: '3', scheme: 'B', date: '2026-11-17' };
  ui.amt = { expr: '1000000' };
  eq(gestCalc(), { nom: 1000000, fee: 30000, cardAmt: 1030000, inAmt: 1000000 });
});
t('gestun: fee rupiah, koma desimal, dan kosong', () => {
  fresh(); ui.gest = { card: 'c1', wallet: 'w1', feeMode: 'rp', feeVal: '50000', scheme: 'A', date: '2026-11-17' };
  ui.amt = { expr: '1000000' };
  eq(gestCalc().fee, 50000);
  ui.gest.feeMode = 'pct'; ui.gest.feeVal = '2,5';
  eq(gestCalc().fee, 25000, 'koma dibaca desimal');
  ui.gest.feeVal = '';
  eq(gestCalc().fee, 0);
});
t('gestun: kekayaan bersih hanya turun sebesar fee', () => {
  fresh();
  const nom = 2000000, fee = 60000;
  S.tx = [
    tx({ t: 'gcard', acc: 'c1', amt: nom }),
    tx({ t: 'gin', acc: 'w1', amt: nom - fee }),
    tx({ t: 'gfee', acc: 'c1', amt: fee })
  ];
  const before = 1500000; recalc();
  eq(net(), before - fee);
});

/* ============ limit kartu ============ */
t('limit: kartu dengan limit sendiri', () => {
  fresh({ tx: [tx({ t: 'exp', acc: 'c1', amt: 1250000, cat: 'k1' })] }); recalc();
  const i = cardInfo(S.cards[0]);
  eq([i.limit, i.mine, i.other, i.used, i.remain], [5000000, 1250000, 0, 1250000, 3750000]);
});
t('limit: kartu satu pool berbagi plafon', () => {
  fresh({
    pools: [{ id: 'p1', name: 'Plafon', limit: 10000000 }],
    cards: [{ id: 'c1', name: 'A', last4: '1', pool: 'p1' }, { id: 'c2', name: 'B', last4: '2', pool: 'p1' }],
    tx: [tx({ t: 'exp', acc: 'c1', amt: 3000000, cat: 'k1' }), tx({ t: 'exp', acc: 'c2', amt: 2000000, cat: 'k1' })]
  }); recalc();
  const a = cardInfo(S.cards[0]), b = cardInfo(S.cards[1]);
  eq([a.limit, a.mine, a.other, a.remain], [10000000, 3000000, 2000000, 5000000]);
  eq([b.mine, b.other, b.remain], [2000000, 3000000, 5000000]);
});
t('limit: melebihi limit memberi sisa negatif', () => {
  fresh({ tx: [tx({ t: 'exp', acc: 'c1', amt: 6000000, cat: 'k1' })] }); recalc();
  eq(cardInfo(S.cards[0]).remain, -1000000);
});

/* ============ tagihan berulang dan tanggal ============ */
t('tanggal: monShift lintas tahun', () => {
  eq(monShift('2026-12', 1), '2027-01');
  eq(monShift('2026-01', -1), '2025-12');
  eq(monShift('2026-11', 0), '2026-11');
});
t('tanggal: recDate menyesuaikan akhir bulan', () => {
  eq(recDate({ day: 31 }, '2027-02'), '2027-02-28');
  eq(recDate({ day: 31 }, '2028-02'), '2028-02-29', 'tahun kabisat');
  eq(recDate({ day: 15 }, '2026-11'), '2026-11-15');
});
t('tanggal: nextOcc dan daysTo (hari ini 17 Nov)', () => {
  eq(ymd(nextOcc(20)), '2026-11-20');
  eq(daysTo(nextOcc(20)), 3);
  eq(ymd(nextOcc(10)), '2026-12-10', 'tanggal sudah lewat -> bulan depan');
  eq(ymd(nextOcc(31)), '2026-11-30', 'dijepit ke akhir bulan');
  eq(daysTo(nextOcc(17)), 0);
});
t('berulang: membuat transaksi yang terlewat, tidak yang belum tiba', () => {
  fresh({ recur: [{ id: 'r1', t: 'exp', acc: 'w1', amt: 100000, cat: 'k1', day: 31, last: '2026-08' }] });
  const n = runRecur();
  eq(n, 2, 'Sep dan Okt dibuat; Nov (30) belum tiba');
  eq(S.tx.map((x) => x.d).sort(), ['2026-09-30', '2026-10-31']);
  eq(S.recur[0].last, '2026-10');
});
t('berulang: tanggal yang sudah lewat bulan ini ikut dibuat', () => {
  fresh({ recur: [{ id: 'r1', t: 'inc', acc: 'w1', amt: 5000000, cat: 'k2', day: 10, last: '2026-09' }] });
  eq(runRecur(), 2);
  eq(S.tx.map((x) => x.d).sort(), ['2026-10-10', '2026-11-10']);
});
t('berulang: dijalankan dua kali tidak menggandakan', () => {
  fresh({ recur: [{ id: 'r1', t: 'exp', acc: 'w1', amt: 100000, cat: 'k1', day: 5, last: '2026-08' }] });
  runRecur(); const n = S.tx.length;
  eq(runRecur(), 0); eq(S.tx.length, n);
});

/* ============ agregat ============ */
t('catMonth: hanya bulan ini dan jenis yang sesuai', () => {
  fresh({
    tx: [
      tx({ t: 'exp', acc: 'w1', amt: 100000, cat: 'k1', d: '2026-11-03' }),
      tx({ t: 'exp', acc: 'w1', amt: 50000, cat: 'k1', sub: 'Kopi', d: '2026-11-04' }),
      tx({ t: 'exp', acc: 'w1', amt: 999000, cat: 'k1', d: '2026-10-30' }),
      tx({ t: 'inc', acc: 'w1', amt: 700000, cat: 'k2', d: '2026-11-01' }),
      tx({ t: 'exp', acc: 'w1', amt: 12000, d: '2026-11-05' })
    ]
  }); recalc();
  const e = catMonth('exp'), i = catMonth('inc');
  eq(e.tot, 150000, 'bulan lalu dan tanpa kategori tidak dihitung');
  eq(e.cats.k1, 150000);
  eq(i.tot, 700000);
});
t('series: titik terakhir sama dengan saldo dan tagihan sekarang', () => {
  fresh({
    tx: [
      tx({ t: 'inc', acc: 'w1', amt: 300000, cat: 'k2', d: '2026-11-01' }),
      tx({ t: 'exp', acc: 'c1', amt: 120000, cat: 'k1', d: '2026-11-05' }),
      tx({ t: 'xfer', acc: 'w1', to: 'w2', amt: 50000, d: '2026-11-09' })
    ]
  }); recalc();
  const s = series(), last = s[s.length - 1];
  eq(s[0].d, '2026-11-01');
  eq(last.d, '2026-11-17');
  eq(last.a, Object.values(D.bal).reduce((a, b) => a + b, 0));
  eq(last.l, 120000);
});
t('grpBal: jumlah saldo dompet dalam kelompok', () => {
  fresh({ tx: [tx({ t: 'exp', acc: 'w1', amt: 100000, cat: 'k1' })] }); recalc();
  eq(grpBal(S.groups[0]), 1400000);
});

/* ============ normalisasi data (impor / data lama) ============ */
t('normalize: objek kosong tidak error dan menghasilkan struktur lengkap', () => {
  const s = normalize({});
  ['groups', 'wallets', 'pools', 'cards', 'cats', 'tx', 'recur', 'purs'].forEach((k) => ok(Array.isArray(s[k]), k));
  ok(s.settings.owned.includes('kubus'), 'Kubus selalu dimiliki');
  eq(s.settings.mascotChar, 'kubus');
});
t('normalize: nilai pengaturan tidak sah direset', () => {
  const s = normalize({ settings: { wl: 'ungu', mascot: 'x', stk: 'apa', owned: ['bukan-ada'], mascotChar: 'hantu' } });
  eq(s.settings.wl, 'neon'); eq(s.settings.mascot, 'on'); eq(s.settings.stk, 'badge');
  eq(s.settings.owned, ['kubus']); eq(s.settings.mascotChar, 'kubus');
});
t('normalize: transaksi berulang dibersihkan', () => {
  const s = normalize({ recur: [
    { id: 'a', t: 'exp', amt: 0, day: 5 }, { id: 'b', t: 'xfer', amt: 100, day: 5 },
    { id: 'c', t: 'exp', amt: '1500.7', day: 99, last: 'rusak' }, null
  ] });
  eq(s.recur.length, 1);
  eq(s.recur[0].amt, 1501); eq(s.recur[0].day, 31);
  ok(/^\d{4}-\d{2}$/.test(s.recur[0].last), 'last diperbaiki');
});
t('normalize: kartu dengan dompet terhubung yang hilang dikosongkan', () => {
  const s = normalize({ wallets: [{ id: 'w1', g: 'g', name: 'A' }], cards: [{ id: 'c1', wallet: 'w1' }, { id: 'c2', wallet: 'hilang' }, { id: 'c3' }] });
  eq(s.cards.map((c) => c.wallet), ['w1', '', '']);
  eq(s.cards[0].minPct, 10);
});
t('normalize: peruntukan teks lama menjadi daftar bernama', () => {
  const s = normalize({ wallets: [{ id: 'w1', g: 'g', name: 'A', p: 'Liburan' }, { id: 'w2', g: 'g', name: 'B', p: 'liburan' }] });
  eq(s.purs.length, 1, 'nama sama (tanpa peduli huruf) dipakai bersama');
  eq(s.wallets[0].pu, s.wallets[1].pu);
  eq(s.wallets[0].p, undefined);
});
t('normalize: anggaran negatif atau teks menjadi 0', () => {
  const s = normalize({ cats: [{ id: 'x', t: 'exp', budget: -5 }, { id: 'y', t: 'exp', budget: '250000.4' }] });
  eq(s.cats[0].budget, 0); eq(s.cats[1].budget, 250000);
});

/* ============ data contoh ============ */
t('contoh: konsisten, tanpa NaN, semua akun dikenal', () => {
  S = makeSample(); recalc();
  ok(S.tx.length > 100, 'banyak transaksi');
  ok(Object.values(D.bal).every(Number.isFinite), 'saldo angka');
  ok(Object.values(D.debt).every(Number.isFinite), 'tagihan angka');
  const ids = new Set([...S.wallets, ...S.cards].map((a) => a.id));
  ok(S.tx.every((x) => x.t === 'gfee' || ids.has(x.acc)), 'akun tiap transaksi ada (biaya admin gestun memang tanpa akun)');
  ok(S.tx.every((x) => x.t !== 'xfer' && x.t !== 'pay' || ids.has(x.to)), 'tujuan ada');
  ok(S.tx.every((x) => x.d <= '2026-11-17'), 'tidak ada tanggal masa depan');
  ok(S.tx.every((x) => x.amt > 0), 'nominal positif');
});
t('contoh: deterministik (dua kali bangun sama)', () => {
  const a = makeSample(), b = makeSample();
  eq(a.tx.length, b.tx.length);
  eq(a.tx.reduce((s, x) => s + x.amt, 0), b.tx.reduce((s, x) => s + x.amt, 0));
});

/* ============ uji asap: halaman & sheet terbuka tanpa error JS ============ */
const smoke = [];
const s = (name, code) => smoke.push([name, code]);
['home', 'mut', 'an', 'set'].forEach((v) => s('halaman ' + v, `ui.view='${v}';render()`));
['wallet', 'cat', 'rec', 'group', 'pur', 'card'].forEach((m) => s('Kelola → ' + m, `ui.view='manage';ui.mg='${m}';render()`));
s('Beranda dengan mode privasi', `S.settings.privacy=true;ui.view='home';render();S.settings.privacy=false;render()`);
s('sheet Catat pengeluaran', `ui.view='home';render();openNew({t:'exp'})`);
s('sheet Ubah transaksi', `openEdit(S.tx.find(x=>x.t==='exp').id)`);
s('sheet Transfer', `openXfer(S.wallets[0].id);ui.amt.expr='1000';updateAmt()`);
s('sheet Bayar kartu', `openPay(S.cards[0].id);ui.amt.expr='1000';updateAmt()`);
s('sheet Gestun', `openGest(S.cards[0].id);ui.amt.expr='1000000';ui.gest.feeVal='3';updateAmt()`);
s('sheet Detail dompet', `ui.accd={id:S.wallets[0].id};ui.sheet='accd';renderSheet()`);
s('sheet Detail kartu', `ui.accd={id:S.cards[0].id};ui.sheet='accd';renderSheet()`);
s('sheet Tambah dompet', `openForm('wallet')`);
s('sheet Tambah kategori', `openForm('cat')`);
s('sheet Ekspor cadangan', `ui.backup={mode:'export'};ui.sheet='backup';renderSheet()`);
s('sheet Koleksi teman', `openKoleksi()`);
s('Koleksi: bungkus terbuka & hasil', `openKoleksi();ui.mk={phase:'tearing',res:{c:MK[0],isNew:true}};renderSheet();ui.mk.phase='reveal';renderSheet()`);

module.exports = { cases, smoke };
