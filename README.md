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

## Dompet terhubung ke kartu kredit
Setiap kartu punya satu dompet terhubung (field `wallet` pada kartu). Bayar kartu hanya keluar dari dompet itu, dan dana gestun cair ke dompet itu. Kartu lama yang belum punya dompet terhubung tetap bisa dipakai dengan memilih dompet manual, sampai dompetnya diatur lewat Kelola → Kartu → Ubah.

## Menu Gestun
Menu Gestun bisa dinyalakan atau dimatikan di Atur (`settings.gestun`, bawaan aktif). Saat nonaktif, tombol Gestun di Beranda, kartu, dan filter Transaksi disembunyikan. Riwayat gestun yang sudah ada tetap tersimpan dan terlihat di daftar transaksi.

## Riwayat transaksi per hari
Di tab Transaksi, hari ini terbuka dan hari sebelumnya tertutup. Header tiap hari tetap menampilkan jumlah transaksi, total masuk, total keluar, dan selisih. Ketuk header untuk membuka atau menutup. Saat mencari atau memakai filter, semua hari terbuka. Status buka-tutup tidak disimpan, jadi kembali ke bawaan setiap halaman dimuat ulang.

## Kalender di Riwayat
Di bawah ringkasan Keluar/Masuk/Selisih, tab Transaksi menampilkan kalender bulan. Tiap tanggal menampilkan selisih harian (masuk dikurangi keluar) dalam bentuk ringkas (misalnya `+10jt`, `−192rb`), hijau untuk plus dan merah untuk minus. Tanggal yang hanya berisi transfer atau bayar kartu bertanda titik. Ketuk tanggal untuk menampilkan riwayat transaksi tanggal itu tepat di bawah kalender; ketuk lagi atau tekan tombol tutup untuk menyembunyikannya. Kalender ikut filter dan pencarian, dan memakai titik saat mode privasi aktif.

Kalender awalnya ringkas: satu baris berisi 7 hari terakhir (sampai hari ini) dengan selisih tiap hari dan total selisih minggu itu di header. Ketuk bar kalender untuk membuka seluruh bulan, ketuk lagi untuk meringkas. Di bulan lain, baris ringkas menampilkan minggu terakhir (bulan lalu) atau minggu pertama (bulan depan). Status ringkas atau penuh tidak disimpan.

Kalender bisa dinyalakan atau dimatikan di Atur → Tampilan → Kalender di Riwayat (`settings.calendar`, bawaan aktif). Saat nonaktif, kalender dan panel riwayat tanggal disembunyikan, dan daftar per hari tetap tampil.
