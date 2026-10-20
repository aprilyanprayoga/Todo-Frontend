# Taskflow — Frontend To-Do List

Frontend React + Vite + TypeScript + Tailwind CSS v4, memakai API Express sesuai kontrak yang diberikan.

## Menjalankan lokal

1. Pastikan backend berjalan di `http://localhost:3000`.
2. Salin `.env.example` menjadi `.env`.
3. Pastikan `VITE_API_URL=http://localhost:3000/api`.
4. Jalankan:

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

Output Vite berada di `dist/`.

## Catatan autentikasi

Implementasi ini memakai endpoint backend `/auth/register`, `/auth/login`, `/auth/me`, `/auth/refresh`, `/auth/logout`, `/auth/forgot-password`, dan `/auth/reset-password`. Access dan refresh token disimpan di `localStorage` mengikuti contoh kontrak API yang diberikan. Untuk aplikasi production yang lebih sensitif, pertimbangkan cookie `HttpOnly` melalui backend bila arsitektur backend mendukungnya.

Refresh token dibuat single-flight agar request bersamaan berbagi satu refresh. Backend harus benar-benar mengembalikan bentuk respons yang dijelaskan di API docs.

## Catatan statistik dan pagination

Daftar meminta `limit=100` agar statistik berbasis daftar yang diambil lebih bermanfaat, tetapi statistik Completed/Pending/High priority dihitung dari item yang sedang diterima, bukan agregasi global lintas halaman. Untuk statistik global yang akurat pada dataset lebih dari 100 Todo, idealnya backend menyediakan endpoint statistik atau frontend mengambil seluruh halaman. Total tasks menggunakan `meta.total` bila tersedia.

## Deployment Vercel

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL` diisi URL backend production yang sebenarnya dan diakhiri `/api` jika backend menggunakannya.
- Daftarkan domain Vercel frontend pada `FRONTEND_URL` backend.
- Jangan menaruh service-role key atau secret backend pada variabel `VITE_`.

## Belum diverifikasi

Belum diuji terhadap backend nyata karena server backend, kredensial, dan URL production tidak disertakan. Jalankan build setelah `npm install`, lalu uji alur autentikasi dan CRUD dengan backend yang aktif.