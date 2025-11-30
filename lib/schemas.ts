// Schema definitions for Warehouse Management System

// User model
export interface User {
  id: string;
  username: string;
  password: string; // hashed password
  role: "admin" | "staff" | "supervisor";
  nama_lengkap: string;
  created_at: Date;
}

// Category model
export interface Category {
  id: string;
  nama_kategori: string;
  deskripsi: string;
  created_at: Date;
}

// RackLocation model
export interface RackLocation {
  id: string;
  nama_lokasi: string;
  deskripsi: string;
  created_at: Date;
}

// Product model
export interface Product {
  id: string;
  sku: string;
  nama_produk: string;
  kategori: string; // Elektronik, Pakaian, Makanan, dll
  deskripsi: string;
  stok: number;
  lokasi_rak: string; // Contoh: Rak-A1-01
  satuan: string; // Pcs, Box, Kardus, Pack
  harga: number;
  stok_minimum: number;
  created_at: Date;
  updated_at: Date;
}

// Order model
export interface Order {
  id: string;
  nomor_order: string;
  customer_nama: string;
  customer_alamat: string;
  customer_telepon: string;
  produk: OrderItem[];
  total_harga: number;
  status: "pending" | "diproses" | "dikirim" | "selesai" | "batal";
  nomor_resi?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  produk_id: string;
  nama_produk: string;
  jumlah: number;
  harga_satuan: number;
}

// Inventory Movement model
export interface InventoryMovement {
  id: string;
  produk_id: string;
  jenis: "masuk" | "keluar"; // incoming or outgoing
  jumlah: number;
  tanggal: Date;
  keterangan: string;
  user_id: string; // who made the movement
}