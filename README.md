# 🛒 UAS CSP - Dashboard Produk (Next.js + Supabase)

Aplikasi web dashboard manajemen produk berbasis **role** (`admin` dan `user`) dengan **CRUD produk** untuk admin dan tampilan read-only untuk user biasa. Dibuat menggunakan **Next.js 15 (App Router)** dan **Supabase**, untuk memenuhi Tugas Akhir mata kuliah.

---

## ✅ Fitur Aplikasi

- ✅ **Sign-in** berdasarkan username dan password
- ✅ **Role-based access**: admin bisa tambah/edit/hapus produk, user hanya bisa lihat
- ✅ **Form edit muncul di atas** saat tombol "Edit" ditekan
- ✅ Konfirmasi **SweetAlert2** untuk Edit & Delete
- ✅ Validasi form & alert jika error
- ✅ UI responsif & bersih dengan Tailwind CSS
- ✅ Protected route (redirect ke `/signin` jika belum login)

---

## 🌐 Deployment & Repositori

| Keterangan              | URL                                                                 |
|-------------------------|----------------------------------------------------------------------|
| 🔗 GitHub Repo          | [https://github.com/TimothyVieri/uas-csp-nextjs](https://github.com/TimothyVieri/uas-csp-nextjs) |
| 🔗 Vercel Live Preview  | [https://uas-csp-weld.vercel.app/signin](https://uas-csp-weld.vercel.app/signin) |

---

## 🔐 Akun untuk Pengujian

| Role     | Username  | Password        |
|----------|-----------|-----------------|
| Admin    | `admin1`  | `adminpassword` |
| User     | `user1`   | `password123`   |

---

## 🧪 Bukti Program Berjalan

Berikut adalah screenshot halaman utama aplikasi ada di repo folder screenshot
> Screenshot disimpan dalam folder `screenshots/` di repo.

## 🛠️ Cara Menjalankan di Lokal

1. Clone repo:
   ```bash
   git clone https://github.com/TimothyVieri/uas-csp-nextjs.git
   
   cd uas-csp-nextjs


2. Instalasi:
    ```bash
    npm install

3. buat .env.local jika belum ada:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=https://ccsfciemdgquwyzsltyr.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjc2ZjaWVtZGdxdXd5enNsdHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTAzODEsImV4cCI6MjA2NjA4NjM4MX0.MaN131firERcxBhzm-JajPDufsTriN8DrK8asJuQIsw
