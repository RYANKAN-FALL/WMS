import { ObjectId } from 'mongodb';
import clientPromise from './mongodb';

// Define interfaces for our collections
export interface User {
  _id?: ObjectId;
  id?: string;
  username: string;
  email?: string;
  password: string;
  nama_lengkap: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id?: ObjectId;
  id?: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  price: number;
  stock: number;
  minStock: number;
  imageUrl?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id?: ObjectId;
  id?: string;
  orderId: string;
  status: string;
  totalAmount: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  _id?: ObjectId;
  id?: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface InventoryLog {
  _id?: ObjectId;
  id?: string;
  productId: string;
  type: string; // "IN" or "OUT"
  quantity: number;
  reason: string;
  userId: string;
  createdAt: Date;
}

// Main DB utility class
class DB {
  async connect() {
    return await clientPromise;
  }

  async getDb() {
    const client = await this.connect();
    return client.db();
  }

  // User-related methods
  async findUserByUsername(username: string) {
    const db = await this.getDb();
    return await db.collection<User>('users').findOne({ username });
  }

  async findUserById(id: string) {
    const db = await this.getDb();
    return await db.collection<User>('users').findOne({ _id: new ObjectId(id) });
  }

  async createUser(userData: Omit<User, '_id'>) {
    const db = await this.getDb();
    const result = await db.collection<User>('users').insertOne({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { ...userData, _id: result.insertedId };
  }

  // Product-related methods
  async getProducts() {
    const db = await this.getDb();
    return await db.collection<Product>('products').find({}).toArray();
  }

  async getProductById(id: string) {
    const db = await this.getDb();
    return await db.collection<Product>('products').findOne({ _id: new ObjectId(id) });
  }

  async createProduct(productData: Omit<Product, '_id'>) {
    const db = await this.getDb();
    const result = await db.collection<Product>('products').insertOne({
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { ...productData, _id: result.insertedId };
  }

  async updateProduct(id: string, updateData: Partial<Product>) {
    const db = await this.getDb();
    const result = await db.collection<Product>('products').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result;
  }

  async deleteProduct(id: string) {
    const db = await this.getDb();
    return await db.collection<Product>('products').deleteOne({ _id: new ObjectId(id) });
  }

  // Order-related methods
  async getOrders() {
    const db = await this.getDb();
    return await db.collection<Order>('orders').find({}).toArray();
  }

  async getOrderById(id: string) {
    const db = await this.getDb();
    return await db.collection<Order>('orders').findOne({ _id: new ObjectId(id) });
  }

  async createOrder(orderData: Omit<Order, '_id'>) {
    const db = await this.getDb();
    const result = await db.collection<Order>('orders').insertOne({
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { ...orderData, _id: result.insertedId };
  }

  // Inventory log methods
  async createInventoryLog(logData: Omit<InventoryLog, '_id'>) {
    const db = await this.getDb();
    const result = await db.collection<InventoryLog>('inventoryLogs').insertOne({
      ...logData,
      createdAt: new Date()
    });
    return { ...logData, _id: result.insertedId };
  }
}

const db = new DB();
export default db;
