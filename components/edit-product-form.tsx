"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";

interface EditProductFormProps {
  product: {
    id: string;
    name: string;
    sku: string;
    categoryId: string;
    description?: string;
    price: number;
    stock: number;
    minStock: number;
    rackLocationId?: string;
    imageUrl?: string;
  };
  categories: Array<{ id: string; name: string }>;
  rackLocations: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProductForm({ 
  product, 
  categories, 
  rackLocations, 
  onClose, 
  onSuccess 
}: EditProductFormProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    sku: product.sku,
    categoryId: product.categoryId,
    description: product.description || "",
    price: product.price,
    stock: product.stock,
    minStock: product.minStock,
    rackLocationId: product.rackLocationId || "",
    imageUrl: product.imageUrl || "",
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('price') || name.includes('stock') || name.includes('minStock') ?
        Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let message = "Gagal memperbarui produk";
        try {
          const cloned = response.clone();
          const errorJson = await cloned.json().catch(() => null);
          if (errorJson?.message) {
            message = errorJson.message;
          } else {
            const text = await response.text().catch(() => "");
            if (text) message = text;
          }
        } catch {
          // ignore parse errors
        }
        setError(message);
        return;
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memperbarui produk");
      console.warn(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nama Produk</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
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
            {categories.map((category) => (
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
            {rackLocations.map((location) => (
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
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </div>
    </form>
  );
}
