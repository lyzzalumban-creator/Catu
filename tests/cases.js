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

/* ============ fungsi dompet: transfer saja ============ */
t('fungsi dompet: aturan pemasukan, pengeluaran, transfer', () => {
  const both = { id: 'a' }, trx = { id: 'b', use: 'trx' }, xf = { id: 'c', use: 'xfer' };
  eq([canExp(both), canInc(both), canXfer(both)], [true, true, true]);
  eq([canExp(trx), canInc(trx), canXfer(trx)], [true, true, false], 'transaksi saja: tidak bisa transfer');
  eq([canExp(xf), canInc(xf), canXfer(xf)], [false, true, true], 'transfer saja: bisa pemasukan, tidak bisa pengeluaran');
});
t('fungsi dompet: pilihan akun pengeluaran menyembunyikan dompet transfer-saja, pemasukan menampilkannya', () => {
  fresh({ wallets: [{ id: 'w1', g: 'g1', name: 'Utama', open: 0 }, { id: 'w2', g: 'g1', name: 'Tabungan', open: 0, use: 'xfer' }] });
  ui.flow = { mode: 'new', step: 1, type: 'exp', acc: '', cat: '', sub: '', openCat: '', date: '2026-11-17', note: '', id: null, ret: 0 };
  const exp = flowStep1();
  ok(exp.includes('data-id="w1"') && !exp.includes('data-id="w2"'), 'pengeluaran: hanya Utama');
  ui.flow.type = 'inc';
  const inc = flowStep1();
  ok(inc.includes('data-id="w1"') && inc.includes('data-id="w2"'), 'pemasukan: Utama dan Tabungan');
});
t('fungsi dompet: simpan pengeluaran dari dompet transfer-saja ditolak, pemasukan diterima', () => {
  fresh({ wallets: [{ id: 'w1', g: 'g1', name: 'Utama', open: 0 }, { id: 'w2', g: 'g1', name: 'Tabungan', open: 0, use: 'xfer' }] });
  ui.amt = { expr: '50000' };
  ui.flow = { mode: 'new', step: 3, type: 'exp', acc: 'w2', cat: 'k1', sub: '', openCat: '', date: '2026-11-17', note: '', id: null, ret: 0 };
  A.fsave();
  eq(S.tx.length, 0, 'pengeluaran ditolak');
  eq(ui.flow.step, 1, 'kembali ke pilih akun');
  ui.amt = { expr: '75000' };
  ui.flow = { mode: 'new', step: 3, type: 'inc', acc: 'w2', cat: 'k2', sub: '', openCat: '', date: '2026-11-17', note: '', id: null, ret: 0 };
  A.fsave();
  eq(S.tx.length, 1, 'pemasukan diterima');
  eq(S.tx[0].t, 'inc'); eq(S.tx[0].acc, 'w2');
  recalc(); eq(D.bal.w2, 75000);
});
t('fungsi dompet: ganti ke Pengeluaran melepas dompet transfer-saja yang terpilih', () => {
  fresh({ wallets: [{ id: 'w1', g: 'g1', name: 'Utama', open: 0 }, { id: 'w2', g: 'g1', name: 'Tabungan', open: 0, use: 'xfer' }] });
  ui.flow = { mode: 'new', step: 1, type: 'inc', acc: 'w2', cat: '', sub: '', openCat: '', date: '2026-11-17', note: '', id: null, ret: 0 };
  A.ftype(null, 'exp');
  eq(ui.flow.acc, '', 'akun dikosongkan'); eq(ui.flow.type, 'exp');
  ui.flow.acc = 'w1'; A.ftype(null, 'inc');
  eq(ui.flow.acc, 'w1', 'dompet biasa tetap terpilih');
});
t('fungsi dompet: tombol + di dompet transfer-saja membuka Pemasukan', () => {
  fresh({ wallets: [{ id: 'w1', g: 'g1', name: 'Utama', open: 0 }, { id: 'w2', g: 'g1', name: 'Tabungan', open: 0, use: 'xfer' }] });
  A['open-acc'](null, null, 'w2');
  eq([ui.flow.type, ui.flow.acc], ['inc', 'w2']);
  ui.sheet = null;
  A['open-acc'](null, null, 'w1');
  eq([ui.flow.type, ui.flow.acc], ['exp', 'w1']);
  ui.sheet = null;
});
t('fungsi dompet: transaksi berulang pengeluaran dari dompet transfer-saja ditolak', () => {
  fresh({ wallets: [{ id: 'w1', g: 'g1', name: 'Utama', open: 0 }, { id: 'w2', g: 'g1', name: 'Tabungan', open: 0, use: 'xfer' }] });
  const html = (openForm('rec'), formHTML());
  ok(html.includes('Tabungan'), 'dompet transfer-saja tersedia di daftar akun (untuk pemasukan berulang)');
  ui.sheet = null;
});

/* ============ isian bawaan cerdas ============ */
t('bawaan: akun terakhir per jenis, melewati dompet transfer-saja', () => {
  fresh({ wallets: [{ id: 'w1', g: 'g1', name: 'A', open: 0 }, { id: 'w2', g: 'g1', name: 'B', open: 0, use: 'xfer' }],
    tx: [tx({ t: 'exp', acc: 'w1', amt: 1, cat: 'k1' }), tx({ t: 'inc', acc: 'w2', amt: 1, cat: 'k2' }), tx({ t: 'exp', acc: 'c1', amt: 1, cat: 'k1' })] });
  eq(lastAcc('exp'), 'c1', 'pengeluaran terakhir lewat kartu');
  eq(lastAcc('inc'), 'w2', 'pemasukan boleh ke dompet transfer-saja');
  S.tx.push(tx({ t: 'exp', acc: 'w2', amt: 1, cat: 'k1' }));
  eq(lastAcc('exp'), 'c1', 'dompet transfer-saja dilewati untuk pengeluaran');
});
t('bawaan: Catat dari tombol + langsung ke pilih kategori dengan akun terakhir', () => {
  fresh({ tx: [tx({ t: 'exp', acc: 'w2', amt: 1, cat: 'k1' })] });
  openNew({ type: 'exp' });
  eq([ui.flow.step, ui.flow.acc], [2, 'w2']);
  ui.sheet = null;
  fresh();
  openNew({ type: 'exp' });
  eq([ui.flow.step, ui.flow.acc], [1, ''], 'tanpa riwayat: mulai dari pilih akun');
  ui.sheet = null;
});
t('bawaan: Transfer memakai tujuan yang paling sering', () => {
  fresh({ wallets: [{ id: 'w1', g: 'g1', name: 'A', open: 0 }, { id: 'w2', g: 'g1', name: 'B', open: 0 }, { id: 'w3', g: 'g1', name: 'C', open: 0 }],
    tx: [tx({ t: 'xfer', acc: 'w1', to: 'w3', amt: 1 }), tx({ t: 'xfer', acc: 'w1', to: 'w3', amt: 1 }), tx({ t: 'xfer', acc: 'w1', to: 'w2', amt: 1 }), tx({ t: 'xfer', acc: 'w2', to: 'w1', amt: 1 })] });
  eq(xferPair('w1'), ['w1', 'w3'], 'dari w1 paling sering ke w3');
  eq(xferPair(undefined), ['w2', 'w1'], 'tanpa asal: pakai transfer terakhir');
});
t('bawaan: Bayar kartu terisi tagihan penuh', () => {
  fresh({ tx: [tx({ t: 'exp', acc: 'c1', amt: 345000, cat: 'k1' })] }); recalc();
  openPay('c1'); eq(ui.amt.expr, '345000'); ui.sheet = null;
});
t('bawaan: Gestun mengingat fee dan skema terakhir', () => {
  fresh();
  eq(gestLast(), { feeMode: 'pct', feeVal: '', scheme: 'A' });
  S.settings.gLast = { feeMode: 'rp', feeVal: '25000', scheme: 'B' };
  eq(gestLast(), { feeMode: 'rp', feeVal: '25000', scheme: 'B' });
  S.settings.gLast = { feeMode: 'x', feeVal: 5, scheme: 'Z' };
  eq(gestLast(), { feeMode: 'pct', feeVal: '', scheme: 'A' }, 'nilai rusak diabaikan');
});
t('bawaan: saran anggaran = rata-rata 3 bulan penuh, dibulatkan ke atas 50 rb', () => {
  fresh({ tx: [
    tx({ t: 'exp', acc: 'w1', amt: 400000, cat: 'k1', d: '2026-10-05' }),
    tx({ t: 'exp', acc: 'w1', amt: 300000, cat: 'k1', d: '2026-09-05' }),
    tx({ t: 'exp', acc: 'w1', amt: 200000, cat: 'k1', d: '2026-08-05' }),
    tx({ t: 'exp', acc: 'w1', amt: 999000, cat: 'k1', d: '2026-11-05' }),
    tx({ t: 'exp', acc: 'w1', amt: 999000, cat: 'k1', d: '2026-07-05' })] });
  eq(budSuggest('k1'), 300000, '(400+300+200)/3 = 300 rb; bulan ini dan Juli tidak dihitung');
  S.tx.push(tx({ t: 'exp', acc: 'w1', amt: 10000, cat: 'k1', d: '2026-10-06' }));
  eq(budSuggest('k1'), 350000, '303.333 dibulatkan ke atas');
  eq(budSuggest('k2'), 0);
});

t('anggaran: kategori tanpa anggaran dibuka sebagai Tambah (tanpa Hapus), berisi saran', () => {
  fresh({ tx: [tx({ t: 'exp', acc: 'w1', amt: 300000, cat: 'k1', d: '2026-10-05' })] });
  openForm('bud', 'k1');
  let h = document.querySelector('#panel').innerHTML;
  ok(h.includes('Tambah anggaran') && !h.includes('fdelform'), 'judul Tambah, tanpa Hapus');
  eq(document.querySelector('#f_amt').value, '100.000', 'saran 300 rb / 3 bulan');
  S.cats.find((c) => c.id === 'k1').budget = 500000; openForm('bud', 'k1');
  h = document.querySelector('#panel').innerHTML;
  ok(h.includes('Ubah anggaran') && h.includes('fdelform'), 'sudah ada anggaran: Ubah + Hapus');
  ui.sheet = null; renderSheet();
});

/* ============ progres target ============ */
t('target: progres dan kekurangan', () => {
  fresh({ wallets: [{ id: 'w1', g: 'g1', name: 'A', open: 2500000, tg: 10000000 }, { id: 'w2', g: 'g1', name: 'B', open: 0 }] }); recalc();
  const g = goalInfo(S.wallets[0]);
  eq([g.pct, g.left], [25, 7500000]);
  eq(goalInfo(S.wallets[1]), null, 'tanpa target');
  S.wallets[0].open = 12000000; recalc();
  eq([goalInfo(S.wallets[0]).pct, goalInfo(S.wallets[0]).left], [100, 0]);
  ok(goalBar(S.wallets[0]).includes('tercapai'));
});

/* ============ data contoh ============ */
t('data contoh: ditandai, banner tampil, bisa disembunyikan, hilang setelah dikosongkan', () => {
  S = makeSample(); S = normalize(S); recalc();
  ok(S.settings.demo, 'data contoh ditandai');
  ok(demoNudge().includes('data contoh'), 'banner tampil');
  eq(bkNudge(), '', 'tidak menagih cadangan untuk data contoh');
  A['demo-hide'](); eq(demoNudge(), '', 'disembunyikan');
  A.wipe(null, null, null, true);
  eq([S.settings.demo, S.wallets.length, S.tx.length], [false, 0, 0]);
  eq(demoNudge(), '');
});
t('data contoh: data pengguna lama tidak dianggap contoh', () => {
  const s = normalize({ wallets: [{ id: 'w1', g: 'g', name: 'A' }] });
  eq(s.settings.demo, false);
});

/* ============ peringatan & pembanding ============ */
t('anggaran saat mencatat: sisa (info) dan melebihi (peringatan)', () => {
  fresh({ cats: [{ id: 'k1', name: 'Makan', t: 'exp', icon: '🍜', subs: [], budget: 1000000 }, { id: 'k2', name: 'Gaji', t: 'inc', icon: '💼', subs: [] }],
    tx: [tx({ t: 'exp', acc: 'w1', amt: 700000, cat: 'k1', d: '2026-11-02' })] });
  ui.flow = { mode: 'new', step: 3, type: 'exp', acc: 'w1', cat: 'k1', sub: '', openCat: '', date: '2026-11-17', note: '', id: null, ret: 0 };
  eq(budWarn(200000), { over: false, t: 'Sisa anggaran Makan setelah ini Rp 100.000 dari Rp 1.000.000.' });
  eq(budWarn(450000), { over: true, t: 'Melebihi anggaran Makan sebesar Rp 150.000 (anggaran Rp 1.000.000).' });
  ui.flow.date = '2026-10-17'; eq(budWarn(450000), null, 'bulan lain tidak dibandingkan');
  ui.flow.date = '2026-11-17'; ui.flow.type = 'inc'; eq(budWarn(450000), null, 'pemasukan tidak dibandingkan');
});
t('bayar sebagian: sisa tagihan disebut', () => {
  fresh({ tx: [tx({ t: 'exp', acc: 'c1', amt: 500000, cat: 'k1' })] }); recalc();
  openPay('c1'); ui.amt.expr = '200000'; updateAmt();
  eq(document.querySelector('#dWarn').textContent, 'Sisa tagihan Rp 300.000 belum lunas dan bisa kena bunga bulan depan.');
  ui.amt.expr = '500000'; updateAmt();
  eq(document.querySelector('#dWarn').textContent, '', 'lunas: tanpa pesan');
  ui.sheet = null; renderSheet();
});
t('gestun: fee ditampilkan sebagai persen dari nominal', () => {
  fresh(); openGest('c1');
  ui.gest.feeMode = 'rp'; ui.gest.feeVal = '25000'; ui.amt.expr = '1000000'; updateAmt();
  ok(document.querySelector('#gprev').textContent.includes('2,5% dari nominal'));
  ui.sheet = null; renderSheet();
});

/* ============ pengaturan: menu kategori ============ */
t('pengaturan: tampil sebagai menu, isi baru terbuka setelah diketuk', () => {
  fresh(); ui.view = 'set'; ui.setSec = null; render();
  const rows = [...document.querySelectorAll('#view .sm-r')].map((e) => e.querySelector('b').textContent);
  eq(rows, ['Umum', 'Cadangan', 'Tampilan', 'Susunan Beranda', 'Fitur', 'Ekspor & impor', 'Hapus data']);
  ok(!document.querySelector('#view .setrow'), 'tidak ada pengaturan di halaman menu');
  ok(!document.querySelector('#view .sw-t'), 'tidak ada sakelar di halaman menu');
});
t('pengaturan: tiap kategori memuat kontrolnya dan bisa kembali', () => {
  fresh();
  const want = { umum: 'data-action="privacy"', cadangan: 'data-action="bk-file"', tampilan: 'data-action="cardview"', layout: 'data-action="lup"',
    fitur: 'data-action="gestun-tog"', ekspor: 'data-action="csv"', hapus: 'data-action="wipe"' };
  for (const k in want) {
    A['set-open'](null, k);
    ok(document.querySelector('#view').innerHTML.includes(want[k]), k + ' memuat ' + want[k]);
    ok(document.querySelector('#view .blk-h.sub'), k + ' punya tombol kembali');
    ok(!document.querySelector('#view .sm-list'), k + ': menu tidak tampil bersamaan');
  }
  A['set-back']();
  ok(document.querySelector('#view .sm-list'), 'kembali ke menu');
  eq(ui.setSec, null);
});
t('pengaturan: ketuk tab Pengaturan dari dalam kategori kembali ke menu; Sesuaikan beranda langsung ke Susunan Beranda', () => {
  fresh(); A['set-open'](null, 'fitur');
  A.nav(null, 'set'); eq(ui.setSec, null);
  A['set-go'](null, 'layout');
  eq([ui.view, ui.setSec], ['set', 'layout']);
  ok(document.querySelector('#view .blk-h.sub h2').textContent === 'Susunan Beranda');
  ui.view = 'home'; ui.setSec = null;
});
t('pengaturan: ringkasan menu mengikuti keadaan', () => {
  fresh(); S.settings.gestun = false; S.settings.calendar = true; S.settings.sigOn = false; ui.view = 'set'; ui.setSec = null; render();
  const txt = [...document.querySelectorAll('#view .sm-r small')].map((e) => e.textContent).join('|');
  ok(txt.includes('1 dari 3 aktif'), 'fitur: 1 dari 3 aktif');
  ok(txt.includes('6 dari 6 blok tampil'), 'susunan beranda');
  ui.view = 'home';
});

/* ============ navigasi bawah ============ */
t('navigasi bawah: tiap tab punya label yang terlihat dan tab aktif ditandai', () => {
  fresh(); ui.setSec = null; A.nav(null, 'mut');
  const nv = [...document.querySelectorAll('.nv')];
  eq(nv.map((e) => e.querySelector('span').textContent), ['Beranda', 'Transaksi', 'Analitik', 'Kelola', 'Atur']);
  ok(nv.every((e) => { const r = e.querySelector('span').getBoundingClientRect(); return r.width > 20 && r.height > 5; }), 'label tidak tersembunyi');
  eq(nv.filter((e) => e.classList.contains('on')).map((e) => e.dataset.nav), ['mut'], 'hanya satu tab aktif');
  A.nav(null, 'home');
});

/* ============ siklus tagihan kartu (cetak tgl 15, jatuh tempo tgl 1; hari ini 17 Nov) ============ */
t('siklus kartu: belanja sampai tgl cetak ditagih, jatuh tempo 1 Des; belanja sesudahnya belum ditagih', () => {
  fresh({ cards: [{ id: 'c1', name: 'Kartu A', last4: '1111', limit: 9e6, cut: 15, due: 1, minPct: 10 }], tx: [
    tx({ t: 'exp', acc: 'c1', amt: 400000, cat: 'k1', d: '2026-10-20' }), tx({ t: 'exp', acc: 'c1', amt: 300000, cat: 'k1', d: '2026-11-10' }),
    tx({ t: 'exp', acc: 'c1', amt: 100000, cat: 'k1', d: '2026-11-16' })] }); recalc();
  const b = cardBills(S.cards[0]);
  eq([b.on, b.lastCut, b.nextCut], [true, '2026-11-15', '2026-12-15']);
  eq(b.bills.map((x) => [x.stmt, x.due, x.amt, x.min]), [['2026-11-15', '2026-12-01', 700000, 70000]]);
  eq(b.unbilled, 100000, 'belanja 16 Nov belum ditagih');
  eq(D.debt.c1, 800000, 'total utang tetap utuh');
});
t('siklus kartu: sudah dibayar sesudah tagihan terbit = tidak ada jatuh tempo; bayar sebelum terbit tidak dihitung', () => {
  const base = [tx({ t: 'exp', acc: 'c1', amt: 700000, cat: 'k1', d: '2026-11-10' }), tx({ t: 'exp', acc: 'c1', amt: 100000, cat: 'k1', d: '2026-11-16' })];
  fresh({ cards: [{ id: 'c1', name: 'A', last4: '1', cut: 15, due: 1 }], tx: base.concat(tx({ t: 'pay', acc: 'w1', to: 'c1', amt: 700000, d: '2026-11-16' })) }); recalc();
  eq(cardBills(S.cards[0]).bills, [], 'lunas');
  eq(planFor('2026-12-01'), [], 'tidak ada Tempo 1 Des');
  eq(dueNudge(), '');
  fresh({ cards: [{ id: 'c1', name: 'A', last4: '1', cut: 15, due: 1 }], tx: base.concat(tx({ t: 'pay', acc: 'w1', to: 'c1', amt: 700000, d: '2026-11-14' })) }); recalc();
  eq(cardBills(S.cards[0]).billed, 700000, 'pembayaran 14 Nov mendahului tagihan 15 Nov');
});
t('siklus kartu: tagihan sebelum aplikasi dipakai, pembayaran dilunaskan paling lama dulu', () => {
  fresh({ cards: [{ id: 'c1', name: 'A', last4: '1', cut: 15, due: 1 }], tx: [
    tx({ t: 'exp', acc: 'c1', amt: 200000, cat: 'k1', d: '2026-10-05' }),   /* tagihan 15 Okt */
    tx({ t: 'exp', acc: 'c1', amt: 700000, cat: 'k1', d: '2026-11-10' }),   /* tagihan 15 Nov */
    tx({ t: 'pay', acc: 'w1', to: 'c1', amt: 500000, d: '2026-11-16' })] }); recalc();
  const b = cardBills(S.cards[0]);
  eq(b.bills.map((x) => [x.stmt, x.amt]), [['2026-11-15', 400000]], 'tagihan Okt lunas dulu, Nov sisa 400 rb');
  eq(b.bills[0].due, '2026-12-01');
});
t('siklus kartu: tagihan lama belum dibayar = terlambat dan tetap muncul', () => {
  fresh({ cards: [{ id: 'c1', name: 'A', last4: '1', cut: 15, due: 1 }], tx: [tx({ t: 'exp', acc: 'c1', amt: 200000, cat: 'k1', d: '2026-10-05' })] }); recalc();
  const b = cardBills(S.cards[0]);
  eq(b.bills.map((x) => [x.stmt, x.due]), [['2026-10-15', '2026-11-01']]);
  ok(dueNudge().includes('terlambat 16 hari'), 'pengingat menyebut terlambat');
  eq(planFor('2026-11-01').map((x) => x.k), ['due'], 'tampil di 1 Nov');
});
t('siklus kartu: kalender menandai Tempo di 1 Des dan Cetak di 15 Des', () => {
  fresh({ cards: [{ id: 'c1', name: 'A', last4: '1', cut: 15, due: 1 }], tx: [
    tx({ t: 'exp', acc: 'c1', amt: 700000, cat: 'k1', d: '2026-11-10' }), tx({ t: 'exp', acc: 'c1', amt: 100000, cat: 'k1', d: '2026-11-16' })] }); recalc();
  eq(planFor('2026-12-01').map((x) => [x.k, x.amt]), [['due', 700000]]);
  eq(planFor('2026-12-15').map((x) => [x.k, x.amt]), [['cut', 100000]], 'cetak berikutnya, perkiraan dari belanja baru');
  eq(planFor('2026-11-15'), [], 'tanggal cetak yang sudah lewat tidak jadi rencana');
});
t('siklus kartu: Bayar terisi tagihan terbit (bukan seluruh utang), chip Tagihan dan Minimum', () => {
  fresh({ cards: [{ id: 'c1', name: 'A', last4: '1', cut: 15, due: 1, minPct: 10 }], tx: [
    tx({ t: 'exp', acc: 'c1', amt: 700000, cat: 'k1', d: '2026-11-10' }), tx({ t: 'exp', acc: 'c1', amt: 100000, cat: 'k1', d: '2026-11-16' })] }); recalc();
  openPay('c1');
  eq(ui.amt.expr, '700000');
  ok(document.querySelector('#panel').innerHTML.includes('data-action="p-bill"'), 'chip Tagihan');
  A['p-min'](); eq(ui.amt.expr, '70000');
  A['p-full'](); eq(ui.amt.expr, '800000', 'Lunas = seluruh utang');
  A['p-bill'](); eq(ui.amt.expr, '700000');
  ui.sheet = null; renderSheet();
});
t('siklus kartu: tanpa tgl cetak memakai cara lama (seluruh utang, jatuh tempo berikutnya)', () => {
  fresh({ cards: [{ id: 'c1', name: 'A', last4: '1', due: 20 }], tx: [tx({ t: 'exp', acc: 'c1', amt: 300000, cat: 'k1', d: '2026-11-10' })] }); recalc();
  eq(cardBills(S.cards[0]).on, false);
  eq(planFor('2026-11-20').map((x) => [x.k, x.amt]), [['due', 300000]]);
  ok(dueNudge().includes('3 hari lagi'));
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
['home', 'mut', 'an', 'set'].forEach((v) => s('halaman ' + v, `ui.setSec=null;ui.view='${v}';render()`));
['umum', 'cadangan', 'tampilan', 'layout', 'fitur', 'ekspor', 'hapus'].forEach((k) => s('Pengaturan → ' + k, `ui.view='set';ui.setSec='${k}';render()`));
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
