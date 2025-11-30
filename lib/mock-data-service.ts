// Mock data service for WMS dashboard
import { User, Product, Order, InventoryMovement, Category } from "@/lib/schemas";

// This is a mock implementation - in a real app, this would connect to a database
class MockDataService {
  private users: User[] = [
    {
      id: "1",
      username: "admin",
      password: "$2b$10$8K1p/a0T3p2J5u3m4n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k", // 'password' hashed
      role: "admin",
      nama_lengkap: "Admin Gudang",
      created_at: new Date(),
    },
    {
      id: "2",
      username: "staff",
      password: "$2b$10$8K1p/a0T3p2J5u3m4n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k", // 'password' hashed
      role: "staff",
      nama_lengkap: "Staff Gudang",
      created_at: new Date(),
    },
    {
      id: "3",
      username: "supervisor",
      password: "$2b$10$8K1p/a0T3p2J5u3m4n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k", // 'password' hashed
      role: "supervisor",
      nama_lengkap: "Supervisor Gudang",
      created_at: new Date(),
    },
  ];

  private categories: Category[] = [
    {
      id: "1",
      nama_kategori: "Elektronik",
      deskripsi: "Perangkat elektronik dan gadget",
      created_at: new Date(),
    },
    {
      id: "2",
      nama_kategori: "Pakaian",
      deskripsi: "Pakaian dan aksesoris",
      created_at: new Date(),
    },
    {
      id: "3",
      nama_kategori: "Makanan",
      deskripsi: "Makanan dan minuman",
      created_at: new Date(),
    },
    {
      id: "4",
      nama_kategori: "Kesehatan",
      deskripsi: "Produk kesehatan dan kecantikan",
      created_at: new Date(),
    },
  ];

  private products: Product[] = [
    {
      id: "1",
      sku: "ELEC001",
      nama_produk: "Smartphone ABC",
      deskripsi: "Smartphone terbaru dengan fitur canggih",
      kategori: "Elektronik",
      stok: 45,
      lokasi_rak: "Rak-A1-01",
      satuan: "Pcs",
      harga: 5000000,
      stok_minimum: 10,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: "2",
      sku: "PAKAI001",
      nama_produk: "Kemeja Lengan Panjang",
      deskripsi: "Kemeja formal lengan panjang",
      kategori: "Pakaian",
      stok: 120,
      lokasi_rak: "Rak-B2-03",
      satuan: "Pcs",
      harga: 150000,
      stok_minimum: 20,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: "3",
      sku: "MAKAN001",
      nama_produk: "Indomie Goreng",
      deskripsi: "Mie instan rasa goreng",
      kategori: "Makanan",
      stok: 5,
      lokasi_rak: "Rak-C3-05",
      satuan: "Pack",
      harga: 3000,
      stok_minimum: 15,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: "4",
      sku: "KESEHATAN001",
      nama_produk: "Hand Sanitizer",
      deskripsi: "Hand sanitizer antibakteri",
      kategori: "Kesehatan",
      stok: 80,
      lokasi_rak: "Rak-D4-02",
      satuan: "Pcs",
      harga: 25000,
      stok_minimum: 10,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  private orders: Order[] = [
    {
      id: "1",
      nomor_order: "ORD-001",
      customer_nama: "PT ABC Indonesia",
      customer_alamat: "Jl. Merdeka No. 123, Jakarta",
      customer_telepon: "021-12345678",
      produk: [
        {
          produk_id: "1",
          nama_produk: "Smartphone ABC",
          jumlah: 5,
          harga_satuan: 5000000,
        },
      ],
      total_harga: 25000000,
      status: "selesai",
      nomor_resi: "JNE-001234567890",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updated_at: new Date(),
    },
    {
      id: "2",
      nomor_order: "ORD-002",
      customer_nama: "Toko Serba Ada",
      customer_alamat: "Jl. Sudirman No. 45, Bandung",
      customer_telepon: "022-98765432",
      produk: [
        {
          produk_id: "2",
          nama_produk: "Kemeja Lengan Panjang",
          jumlah: 10,
          harga_satuan: 150000,
        },
        {
          produk_id: "4",
          nama_produk: "Hand Sanitizer",
          jumlah: 20,
          harga_satuan: 25000,
        },
      ],
      total_harga: 2000000,
      status: "diproses",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      updated_at: new Date(),
    },
    {
      id: "3",
      nomor_order: "ORD-003",
      customer_nama: "Warung Bu Siti",
      customer_alamat: "Jl. Gatot Subroto No. 10, Surabaya",
      customer_telepon: "031-11122233",
      produk: [
        {
          produk_id: "3",
          nama_produk: "Indomie Goreng",
          jumlah: 30,
          harga_satuan: 3000,
        },
      ],
      total_harga: 90000,
      status: "pending",
      created_at: new Date(), // today
      updated_at: new Date(),
    },
  ];

  private inventoryMovements: InventoryMovement[] = [
    {
      id: "1",
      produk_id: "1",
      jenis: "masuk",
      jumlah: 20,
      tanggal: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      keterangan: "Pembelian dari supplier",
      user_id: "1",
    },
    {
      id: "2",
      produk_id: "2",
      jenis: "keluar",
      jumlah: 5,
      tanggal: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      keterangan: "Pengiriman ke customer",
      user_id: "2",
    },
    {
      id: "3",
      produk_id: "3",
      jenis: "keluar",
      jumlah: 25,
      tanggal: new Date(), // today
      keterangan: "Pengiriman ke customer",
      user_id: "1",
    },
  ];

  // User methods
  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getUserByUsername(username: string): User | undefined {
    return this.users.find(user => user.username === username);
  }

  // Product methods
  getProducts(): Product[] {
    return this.products;
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product {
    const newProduct: Product = {
      ...product,
      id: String(this.products.length + 1),
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.products.push(newProduct);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = {
        ...this.products[index],
        ...updates,
        updated_at: new Date(),
      };
      return this.products[index];
    }
    return undefined;
  }

  deleteProduct(id: string): boolean {
    const initialLength = this.products.length;
    this.products = this.products.filter(product => product.id !== id);
    return this.products.length !== initialLength;
  }

  // Order methods
  getOrders(): Order[] {
    return this.orders;
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find(order => order.id === id);
  }

  createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Order {
    const newOrder: Order = {
      ...order,
      id: String(this.orders.length + 1),
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.orders.push(newOrder);
    
    // Update inventory when creating an order
    if (order.status === 'diproses' || order.status === 'dikirim' || order.status === 'selesai') {
      order.produk.forEach(item => {
        this.updateProductStock(item.produk_id, -item.jumlah);
      });
    }
    
    return newOrder;
  }

  updateOrder(id: string, updates: Partial<Order>): Order | undefined {
    const index = this.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      const oldStatus = this.orders[index].status;
      const newStatus = updates.status;
      
      this.orders[index] = {
        ...this.orders[index],
        ...updates,
        updated_at: new Date(),
      };
      
      // Update inventory when order status changes
      if (oldStatus !== newStatus) {
        const order = this.orders[index];
        if (newStatus === 'diproses' || newStatus === 'dikirim' || newStatus === 'selesai') {
          // Deduct stock
          order.produk.forEach(item => {
            this.updateProductStock(item.produk_id, -item.jumlah);
          });
        } else if (oldStatus === 'diproses' || oldStatus === 'dikirim' || oldStatus === 'selesai') {
          // Restore stock
          order.produk.forEach(item => {
            this.updateProductStock(item.produk_id, item.jumlah);
          });
        }
      }
      
      return this.orders[index];
    }
    return undefined;
  }

  // Inventory methods
  getInventoryMovements(): InventoryMovement[] {
    return this.inventoryMovements;
  }

  getInventoryMovementsByProductId(productId: string): InventoryMovement[] {
    return this.inventoryMovements.filter(movement => movement.produk_id === productId);
  }

  addInventoryMovement(movement: Omit<InventoryMovement, 'id'>): InventoryMovement {
    const newMovement: InventoryMovement = {
      ...movement,
      id: String(this.inventoryMovements.length + 1),
    };
    this.inventoryMovements.push(newMovement);
    
    // Update product stock
    if (movement.jenis === 'masuk') {
      this.updateProductStock(movement.produk_id, movement.jumlah);
    } else {
      this.updateProductStock(movement.produk_id, -movement.jumlah);
    }
    
    return newMovement;
  }

  private updateProductStock(productId: string, quantity: number): void {
    const product = this.getProductById(productId);
    if (product) {
      const newStock = product.stok + quantity;
      this.updateProduct(productId, { stok: newStock, updated_at: new Date() });
    }
  }

  // Category methods
  getCategories(): Category[] {
    return this.categories;
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.find(category => category.id === id);
  }

  // Dashboard statistics
  getDashboardStats() {
    const totalProducts = this.products.length;
    const totalStock = this.products.reduce((sum, product) => sum + product.stok, 0);
    const lowStockProducts = this.products.filter(product => product.stok <= product.stok_minimum).length;
    const totalOrders = this.orders.length;
    const pendingOrders = this.orders.filter(order => order.status === 'pending').length;
    const processedOrders = this.orders.filter(order => 
      order.status === 'diproses' || order.status === 'dikirim' || order.status === 'selesai'
    ).length;

    return {
      totalProducts,
      totalStock,
      lowStockProducts,
      totalOrders,
      pendingOrders,
      processedOrders,
    };
  }

  // Recent orders
  getRecentOrders(limit: number = 5) {
    return this.orders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  // Products near minimum stock
  getLowStockProducts() {
    return this.products
      .filter(product => product.stok <= product.stok_minimum)
      .sort((a, b) => a.stok - b.stok);
  }
}

export const mockDataService = new MockDataService();
