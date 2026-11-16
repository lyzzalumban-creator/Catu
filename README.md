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

Kalender awalnya ringkas: satu baris berisi 7 hari terakhir (sampai hari ini) dengan selisih tiap hari dan total selisih minggu itu di header. Ketuk bar kalender untuk membuka seluruh bulan, ketuk lagi untuk meringkas. Di bulan lain, baris ringkas menampilkan minggu terakhir (bulan lalu) atau minggu pertama (bulan depan). Status ringkas atau penuh tidak disimpan. Baris 7 hari ikut maju saat hari berganti: hari paling lama hilang dan hari baru muncul di kanan, termasuk saat halaman dibiarkan terbuka melewati tengah malam.

Kalender bisa dinyalakan atau dimatikan di Atur → Tampilan → Kalender di Riwayat (`settings.calendar`, bawaan aktif). Saat nonaktif, kalender dan panel riwayat tanggal disembunyikan, dan daftar per hari tetap tampil.

## Gerak (animasi)
Gerak di kalender dan riwayat mengikuti bahasa gerak bagian kartu kredit: easing pegas `--spring` dengan durasi .5 detik dan buka-tutup lewat `grid-template-rows` (sama seperti grup dompet). Panel tanggal membuka dan menutup dengan gerak itu, ganti ringkas/penuh pada kalender menganimasikan tinggi, dan ketuk tanggal tidak lagi menggambar ulang kalender. Pengguna yang mengaktifkan `prefers-reduced-motion` mendapat perpindahan tanpa animasi.

## Analitik (donat)
Donat memakai cincin tipis bertepi bulat. Kategori di bawah 3% (atau di luar 6 teratas) digabung menjadi satu segmen "Lainnya" di donat dan legenda, sedangkan daftar Per kategori tetap menampilkan semuanya. Ketuk segmen donat atau chip legenda untuk menyorot satu kategori: segmen lain meredup, tengah donat berganti ke kategori itu, dan barisnya di bawah ikut menyala; ketuk lagi untuk batal. Pilihan Pengeluaran/Pemasukan memakai tuas geser. Donat dan bar kategori tergambar sekali saat masuk tab atau ganti bulan/jenis, tidak berulang saat baris dilipat atau dibuka. Warna bar tiap kategori sama dengan warna segmennya. Gerak mengikuti bahasa gerak kartu (pegas saat membuka, mulus tanpa bounce saat menutup) dan menghormati `prefers-reduced-motion`.

## Kalkulator nominal
Papan angka berupa grid 4×4 yang sejajar: angka dan tombol = di kiri, operator ÷ × − + di satu kolom di kanan dengan tinggi baris yang sama. Tombol hapus (⌫) ada di sebelah kanan tampilan nominal; ketuk menghapus satu karakter, tahan untuk mengosongkan. Tinggi tombol menyesuaikan tinggi layar (52/46/42 px) supaya tombol Simpan tidak menutup baris bawah.

## Cadangan, ekspor, pengingat
- Atur → Data: **Cadangkan sekarang** (unduh file `.json`, mencatat `settings.lastBackup`) dan **Ekspor CSV** (pemisah `;`, BOM UTF-8, terbuka benar di Excel Indonesia). Beranda menampilkan pengingat kalau data belum dicadangkan 7 hari (tombol Nanti menunda 3 hari).
- **Jatuh tempo kartu**: kartu dengan tagihan dan tanggal jatuh tempo ≤5 hari lagi muncul di atas Beranda dengan tombol Bayar. Tanggal jatuh tempo berikutnya juga tampil sebagai "Tempo" di kalender Riwayat.
- **Anggaran per kategori** (`cat.budget`): atur di Kelola → Kategori (atau tombol "Atur anggaran bulanan" di Analitik). Meter di Analitik hijau di bawah 80%, kuning 80–99%, merah mulai 100%.
- **Transaksi berulang** (`S.recur`): nyalakan "Ulangi tiap bulan" saat mencatat, atau kelola di Kelola → Berulang. Transaksi dibuat otomatis saat aplikasi dibuka pada atau setelah tanggalnya (`runRecur`), dan rencana berikutnya tampil di kalender dengan garis kuning.

## Cadangan Google Drive
Atur → Data → Cadangan Google Drive. Perlu OAuth Client ID tipe Web (Google Cloud Console, Drive API aktif, Authorized JavaScript origin = alamat situs). Cadangan disimpan di `appDataFolder` (folder tersembunyi milik aplikasi, izin `drive.appdata`) dengan nama `kocekly-cadangan.json`. Pengaturan di `settings.gd` (`cid`, `on`, `ok`, `last`, `fileId`).
- Token Google hanya di memori (berlaku ±1 jam) dan tidak pernah masuk ke data atau cadangan. Saat dibuka, aplikasi mencoba masuk diam-diam; kalau gagal, pil di kanan atas menjadi "Masuk Drive" dan mengetuknya membuka login.
- Perubahan data dikirim otomatis 6 detik setelah perubahan terakhir. Pil menampilkan Drive / Drive… / Masuk Drive / Gagal Drive.
- Data di HP selalu menang: tidak ada pemulihan otomatis. Kalau cadangan di Drive lebih baru saat aplikasi dibuka, muncul pengingat; **Pulihkan** meminta ketukan kedua sebagai konfirmasi, dan pengaturan Drive di perangkat tetap dipertahankan.
