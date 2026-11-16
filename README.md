# Kocekly

Aplikasi pencatat keuangan pribadi (dompet, kartu kredit, transaksi, laporan) dalam satu file `index.html`. Tema hitam dan hijau neon, bahasa Indonesia, dibuat untuk HP.

**Pratinjau:** https://claude.ai/artifact/VVxPyFVG1LV4UxKHhEoip1 (artifact privat, hanya pemilik yang bisa membuka)

## Catatan proyek
- Satu file, tanpa build: `index.html`. Semua gaya dan skrip ada di dalamnya.
- Data tersimpan di HP (localStorage, kunci `kantong.v1`). Jangan ganti nama kunci ini agar data lama tidak hilang.
- Balasan dan teks aplikasi dalam bahasa Indonesia.
- Beberapa komponen (tanda tangan, animasi kartu, maskot) diadaptasi dari komponen berlisensi MIT; catatan kredit ada di komentar kode dan harus dipertahankan.

## Pembaruan otomatis
Saat halaman dibuka (atau saat kembali ke aplikasi), `index.html` mengecek versi terbaru di server dan memuat ulang sendiri kalau ada yang berubah. Sidik jari versi disimpan di kunci `catu.ver`; data keuangan (`kantong.v1`) tidak diubah. Syaratnya, perubahan sudah digabung ke branch yang dipublikasikan GitHub Pages.
