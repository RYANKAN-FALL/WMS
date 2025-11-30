Buatkan Warehouse Management System (WMS) dashboard yang sesuai untuk pasar Indonesia dengan fitur lengkap.

## TECHNICAL REQUIREMENTS:
- **Framework**: Next.js 14 dengan App Router
- **Styling**: Tailwind CSS + Components
- **Backend**: Next.js API Routes + MongoDB/PostgreSQL
- **Authentication**: Next-Auth dengan login username/password
- **Bahasa**: Bahasa Indonesia seluruh UI dan label
- @radix-ui untuk components complex
- react-hook-form untuk form handling  
- zod untuk validation
- date-fns untuk manipulasi tanggal
- recharts untuk chart sederhana

## FITUR WMS KHUSUS INDONESIA:

### 1. AUTHENTICATION & ROLE
- Login dengan username & password
- Role: Admin Gudang, Staff, Supervisor
- Session management

### 2. DASHBOARD UTAMA
- Statistik real-time: Total Stok, Order Hari Ini, Stok Menipis
- Chart: Penjualan 7 hari terakhir
- Notifikasi: Stok hampir habis, order pending
- Traffic light system: Merah/kuning/hijau untuk status urgent

### 3. MANAJEMEN INVENTORY
- Data produk: SKU, Nama Produk, Kategori, Stok, Lokasi Rak (Contoh: Rak-A1-01)
- Kategori produk: Elektronik, Pakaian, Makanan, DLL
- Sistem satuan: Pcs, Box, Kardus, Pack
- Alert stok minimum: Warna merah jika stok < 10

### 4. MANAJEMEN ORDER
- Status Order: Pending, Diproses, Dikirim, Selesai, Batal
- Input order dengan nomor resi
- Tracking order sederhana
- Cetak invoice/packing slip

### 5. LAPORAN (REPORTING)
- Laporan harian: Stok Masuk/Keluar
- Laporan bulanan: Penjualan, Produk Terlaris
- Export Excel/PDF sederhana

## STRUKTUR DATABASE YANG DIBUTUHKAN:

### Collection/Table Users:
```javascript
{
  username: "admin",
  password: "hashed",
  role: "admin",
  nama_lengkap: "Admin Gudang",
  created_at: Date
}