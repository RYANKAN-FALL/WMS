"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// no extra imports

export default function CategoryForm({ onSuccess }: { onSuccess?: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description }) });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Gagal menambahkan kategori');
      }
      if (onSuccess) onSuccess();
      setName(''); setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <div className="text-destructive text-sm">{error}</div>}
      <div>
        <Label htmlFor="name">Nama Kategori</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="description">Deskripsi</Label>
        <Input id="description" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
      </div>
    </form>
  );
}
