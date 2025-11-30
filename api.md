# Warehouse Management System – API Ringkas

Semua endpoint base URL: `http://localhost:3000`. Format default JSON.

## Auth
- `POST /api/auth/callback/credentials` – Login dengan body `{ username, password, otp? }`. Jika 2FA aktif, sertakan `otp` (default demo `246810`).
- Session menggunakan JWT (NextAuth).

## Settings
- `GET /api/settings` – Ambil pengaturan lengkap (butuh login).
- `PUT /api/settings` – Simpan pengaturan. Contoh payload:
```json
{
  "profile": { "nama": "Admin", "username": "admin", "email": "admin@example.com", "role": "admin" },
  "security": { "twoFactor": true, "loginAlert": true, "otpHint": "Gunakan 246810" },
  "preference": { "language": "id", "currency": "IDR", "theme": "dark" },
  "notification": { "email": true, "sms": false, "push": true },
  "integration": { "webhooks": "https://example.com/hook", "apiKey": "your-api-key" }
}
```
- `GET /api/settings/public` – Hanya preference & security (untuk form login/FE).

## Integrasi & Notifikasi
- `POST /api/integrations/test-webhook` – Kirim payload test ke webhook yang dikirim di body `{ url }` atau pakai URL tersimpan. Butuh login.
- `POST /api/notifications/test-login` – Trigger alur notifikasi login (email/SMS/push simulasi + webhook jika aktif). Butuh login.

## Products & Inventory
- `GET /api/products?search=&limit=&offset=` – Daftar produk.
- `POST /api/products` – Tambah produk.
- `PUT /api/products/:id` – Ubah produk.
- `DELETE /api/products/:id` – Hapus produk.
- `GET /api/inventory-logs` – Log pergerakan stok.

## Orders
- `GET /api/orders` – Daftar order (support `limit`).
- `POST /api/orders` – Buat order. Body `{ orderItems: [{ productId, quantity, price? }], status: "pending|processing|shipped|delivered|cancelled" }`.

## Categories & Rak
- `GET /api/categories` – Daftar kategori (`search`, `limit`, `page`).
- `POST /api/categories` / `PUT /api/categories/:id` / `DELETE /api/categories/:id`.
- `GET /api/rack-locations` – Daftar lokasi rak (`search`, `limit`, `page`).
- `POST /api/rack-locations` / `PUT /api/rack-locations/:id` / `DELETE /api/rack-locations/:id`.

## Reports & CSV
- `GET /api/reports/orders.csv` – 50 order terbaru (CSV).
- `GET /api/reports/low-stock.csv` – Produk stok rendah (CSV).
- `GET /api/reports/monthly-sales.csv` – Ringkasan penjualan bulanan (CSV).
- `GET /api/reports/best-sellers.csv` – Produk terlaris 3 bulan (CSV).
