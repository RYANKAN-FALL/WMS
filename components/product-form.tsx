"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProductFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

interface RackLocation {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export default function ProductForm({ onClose, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    categoryId: "",
    description: "",
    price: 0,
    stock: 0,
    minStock: 0,
    rackLocationId: "",
    imageUrl: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [rackLocations, setRackLocations] = useState<RackLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories and rack locations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, rackLocationsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/rack-locations")
        ]);

        if (!categoriesRes.ok || !rackLocationsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const categoriesData = await categoriesRes.json();
        const rackLocationsData = await rackLocationsRes.json();

        setCategories(categoriesData.data);
        setRackLocations(rackLocationsData.data);
      } catch (err) {
        setError("Gagal memuat data kategori dan lokasi rak");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" || name === "stock" || name === "minStock" 
        ? Number(value) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let message = "Gagal menambahkan produk";
        try {
          const cloned = response.clone();
          const json = await cloned.json().catch(() => null);
          if (json?.message) {
            message = json.message;
          } else {
            const text = await response.text().catch(() => "");
            if (text) message = text;
          }
        } catch {
          // ignore parse errors, keep default message
        }
        setError(message);
        return;
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menambahkan produk");
      console.warn(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="mt-2 text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input 
            id="sku" 
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="Contoh: PROD-001"
            required
          />
        </div>
        <div>
          <Label htmlFor="name">Nama Produk</Label>
          <Input 
            id="name" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Masukkan nama produk"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="categoryId">Kategori</Label>
          <select 
            id="categoryId" 
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white text-black dark:bg-slate-900 dark:text-slate-100"
            required
          >
            <option value="">Pilih kategori</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="rackLocationId">Lokasi Rak</Label>
          <select 
            id="rackLocationId" 
            name="rackLocationId"
            value={formData.rackLocationId}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white text-black dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">Pilih lokasi rak</option>
            {rackLocations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stock">Stok</Label>
          <Input 
            id="stock" 
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            placeholder="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="minStock">Stok Minimum</Label>
          <Input 
            id="minStock" 
            name="minStock"
            type="number"
            value={formData.minStock}
            onChange={handleChange}
            placeholder="0"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Harga</Label>
          <Input 
            id="price" 
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            placeholder="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="imageUrl">URL Gambar</Label>
          <Input 
            id="imageUrl" 
            name="imageUrl"
            type="text"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://contoh.com/gambar.jpg"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Deskripsi</Label>
        <Input 
          id="description" 
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Deskripsi produk"
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={submitting}
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <svg className="h-4 w-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </>
          ) : (
            "Simpan Produk"
          )}
        </Button>
      </div>
    </form>
  );
}
