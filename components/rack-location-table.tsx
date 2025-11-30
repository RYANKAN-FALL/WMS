"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface RackLocation {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  productCount: number;
}

interface RackLocationTableProps {
  rackLocations: RackLocation[];
}

export default function RackLocationTable({ rackLocations }: RackLocationTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingRack, setEditingRack] = useState<RackLocation | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Filter locations based on search term
  const filteredLocations = rackLocations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (location.description && location.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/rack-locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menambahkan lokasi rak');
      }

      // Reset form and close dialog
      setFormData({ name: "", description: "" });
      setIsDialogOpen(false);
      
      // Refresh the page to show the new location
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menambahkan lokasi rak');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRack) return;

    setEditLoading(true);
    setEditError(null);

    try {
      const response = await fetch(`/api/rack-locations/${editingRack.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal memperbarui lokasi rak');
      }

      setIsEditDialogOpen(false);
      setEditingRack(null);
      window.location.reload();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memperbarui lokasi rak');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (locationId: string, locationName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus lokasi rak "${locationName}"?`)) {
      try {
        const response = await fetch(`/api/rack-locations/${locationId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Gagal menghapus lokasi rak: ${response.status} - ${errorData}`);
        }

        // Refresh the page after deletion
        window.location.reload();
      } catch (error) {
        console.error('Error deleting rack location:', error);
        alert('Gagal menghapus lokasi rak: ' + (error as Error).message);
      }
    }
  };

  return (
    <>
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <CardTitle>Daftar Lokasi Rak</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredLocations.length} lokasi rak ditemukan
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari lokasi rak..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Icons.plus className="mr-2 h-4 w-4" />
                Tambah Lokasi
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-200 dialog-anim">
            <DialogHeader>
              <DialogTitle>Tambah Lokasi Rak Baru</DialogTitle>
              <DialogDescription>
                Tambahkan lokasi rak baru untuk mengorganisir penyimpanan produk
              </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <Label htmlFor="name">Nama Lokasi</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Contoh: Rak-A1-01, Rak-Gudang-01"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tambahkan deskripsi lokasi (opsional)"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={loading}
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Lokasi"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Jumlah Produk</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations.length > 0 ? (
                filteredLocations.map((location) => (
                  <TableRow 
                    key={location.id} 
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="font-mono font-medium">{location.name}</TableCell>
                    <TableCell>
                      {location.description ? (
                        <span>{location.description}</span>
                      ) : (
                        <span className="text-muted-foreground italic">Tidak ada deskripsi</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {location.productCount} produk
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(location.createdAt).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEditingRack(location);
                            setFormData({
                              name: location.name,
                              description: location.description || "",
                            });
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Icons.edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(location.id, location.name)}
                        >
                          <Icons.trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Tidak ada lokasi rak ditemukan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-200 dialog-anim">
        <DialogHeader>
          <DialogTitle>Ubah Lokasi Rak</DialogTitle>
          <DialogDescription>
            Perbarui nama atau deskripsi lokasi rak.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {editError && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {editError}
            </div>
          )}
          <div>
            <Label htmlFor="edit-name">Nama Lokasi</Label>
            <Input
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Contoh: Rak-A1-01, Rak-Gudang-01"
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-description">Deskripsi</Label>
            <Input
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Tambahkan deskripsi lokasi (opsional)"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => { setIsEditDialogOpen(false); setEditingRack(null); }}
              disabled={editLoading}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={editLoading}
            >
              {editLoading ? (
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
      </DialogContent>
    </Dialog>
    </>
  );
}
