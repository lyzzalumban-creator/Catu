#!/usr/bin/env node
/*
 * Uji otomatis penniq. Tidak mengubah index.html.
 *
 *   NODE_PATH=$(npm root -g) node tests/run.js        # jalankan semua
 *   NODE_PATH=$(npm root -g) node tests/run.js gestun # hanya uji yang namanya memuat "gestun"
 *
 * Syarat: Node + paket `playwright` (Chromium). Aplikasi dimuat dari file lokal,
 * tanggal "hari ini" dikunci ke 17 Nov 2026 supaya hasil uji tetap.
 */
const path = require('path');
const { chromium } = require('playwright');
const { cases, smoke } = require('./cases');

const APP = 'file://' + path.resolve(__dirname, '..', 'index.html');
const filter = (process.argv[2] || '').toLowerCase();

/* Date dikunci. Tanpa argumen -> 17 Nov 2026 10:00; selebihnya berperilaku normal. */
const FIX_DATE = `(() => {
  const Real = Date, fixed = new Real(2026, 10, 17, 10, 0, 0).getTime();
  class FD extends Real {
    constructor(...a) { if (a.length === 0) super(fixed); else super(...a); }
    static now() { return fixed; }
  }
  window.Date = FD;
})();`;

/* pembantu yang tersedia di dalam halaman untuk semua uji */
const HELPERS = `
  window.eq = (a, b, msg) => {
    const x = JSON.stringify(a), y = JSON.stringify(b);
    if (x !== y) throw new Error((msg ? msg + ': ' : '') + 'diharapkan ' + y + ', didapat ' + x);
  };
  window.ok = (c, msg) => { if (!c) throw new Error(msg || 'kondisi tidak terpenuhi'); };
  /* buat state bersih: 2 dompet, 1 kartu, 1 kartu tanpa pool, 1 pool */
  window.fresh = (extra) => {
    S = normalize(Object.assign({
      groups: [{ id: 'g1', name: 'Bank' }],
      wallets: [{ id: 'w1', g: 'g1', name: 'Utama', open: 1000000 }, { id: 'w2', g: 'g1', name: 'Cadangan', open: 500000 }],
      pools: [], cards: [{ id: 'c1', name: 'Kartu A', last4: '1111', limit: 5000000 }],
      cats: [{ id: 'k1', name: 'Makan', t: 'exp', icon: '🍜', subs: [] }, { id: 'k2', name: 'Gaji', t: 'inc', icon: '💼', subs: [] }],
      tx: [], recur: [], purs: []
    }, extra || {}));
    recalc();
    return S;
  };
  window.tx = (o) => Object.assign({ id: 't' + Math.random().toString(36).slice(2, 8), d: '2026-11-10', note: '' }, o);
  window.net = () => Object.values(D.bal).reduce((a, b) => a + b, 0) - Object.values(D.debt).reduce((a, b) => a + b, 0);
`;

async function main() {
  const browser = await chromium.launch();
  let pass = 0, fail = 0;
  const failures = [];

  /* --- uji hitungan (satu halaman bersama, state dibuat ulang tiap uji) --- */
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.addInitScript(FIX_DATE);
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  await page.goto(APP);
  await page.waitForFunction(() => typeof recalc === 'function' && typeof S !== 'undefined');
  await page.evaluate(HELPERS);

  for (const [name, fn] of cases) {
    if (filter && !name.toLowerCase().includes(filter)) continue;
    try {
      await page.evaluate(`(${fn})()`);
      pass++;
      console.log('  ok   ' + name);
    } catch (e) {
      fail++;
      failures.push([name, String(e.message).split('\n')[0]]);
      console.log('  GAGAL ' + name + '\n         ' + String(e.message).split('\n')[0]);
    }
  }
  await page.close();

  /* --- uji asap: semua halaman dan sheet terbuka tanpa error JavaScript --- */
  if (!filter || 'asap'.includes(filter) || 'smoke'.includes(filter)) {
    const sp = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await sp.addInitScript(FIX_DATE);
    const errs = [];
    sp.on('pageerror', (e) => errs.push(e.message));
    await sp.goto(APP);
    await sp.waitForFunction(() => typeof makeSample === 'function' && typeof S !== 'undefined' && S);
    await sp.evaluate(() => { const o = S.settings.privacy; S = makeSample(); S.settings.privacy = o; recalc(); render(); });
    for (const [name, code] of smoke) {
      const before = errs.length;
      try {
        await sp.evaluate(code);
        await sp.waitForTimeout(120);
        if (errs.length > before) throw new Error(errs.slice(before).join(' | '));
        pass++;
        console.log('  ok   asap: ' + name);
      } catch (e) {
        fail++;
        failures.push(['asap: ' + name, String(e.message).split('\n')[0]]);
        console.log('  GAGAL asap: ' + name + '\n         ' + String(e.message).split('\n')[0]);
      }
      await sp.evaluate(() => { if (ui.sheet) { ui.sheet = null; renderSheet(); } }).catch(() => {});
    }
    await sp.close();
  }

  await browser.close();
  console.log('\n' + pass + ' lolos, ' + fail + ' gagal');
  if (pageErrors.length) console.log('Catatan: ' + pageErrors.length + ' galat JS saat memuat halaman: ' + pageErrors[0]);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(2); });
