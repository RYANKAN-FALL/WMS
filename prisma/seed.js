/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedDemoData() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('password', 10);

    // Create demo users
    const adminUser = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        nama_lengkap: 'Admin User',
        role: 'admin',
      },
    });

    const staffUser = await prisma.user.upsert({
      where: { username: 'staff' },
      update: {},
      create: {
        username: 'staff',
        email: 'staff@example.com',
        password: hashedPassword,
        nama_lengkap: 'Staff User',
        role: 'staff',
      },
    });

    const supervisorUser = await prisma.user.upsert({
      where: { username: 'supervisor' },
      update: {},
      create: {
        username: 'supervisor',
        email: 'supervisor@example.com',
        password: hashedPassword,
        nama_lengkap: 'Supervisor User',
        role: 'supervisor',
      },
    });

    console.log('Demo users created:');
    console.log('- Admin:', adminUser.username);
    console.log('- Staff:', staffUser.username);
    console.log('- Supervisor:', supervisorUser.username);

    // Create demo categories
    const electronicsCategory = await prisma.category.upsert({
      where: { name: 'Elektronik' },
      update: {},
      create: {
        name: 'Elektronik',
        description: 'Perangkat elektronik',
      },
    });

    const clothingCategory = await prisma.category.upsert({
      where: { name: 'Pakaian' },
      update: {},
      create: {
        name: 'Pakaian',
        description: 'Pakaian dan aksesoris',
      },
    });

    const foodCategory = await prisma.category.upsert({
      where: { name: 'Makanan' },
      update: {},
      create: {
        name: 'Makanan',
        description: 'Makanan dan minuman',
      },
    });

    console.log('Demo categories created:');
    console.log('- Electronics:', electronicsCategory.name);
    console.log('- Clothing:', clothingCategory.name);
    console.log('- Food:', foodCategory.name);

    // Create demo rack locations
    const rackA1 = await prisma.rackLocation.upsert({
      where: { name: 'Rak-A1-01' },
      update: {},
      create: {
        name: 'Rak-A1-01',
        description: 'Rak sebelah kiri, baris pertama',
      },
    });

    const rackB1 = await prisma.rackLocation.upsert({
      where: { name: 'Rak-B1-02' },
      update: {},
      create: {
        name: 'Rak-B1-02',
        description: 'Rak sebelah kanan, baris pertama',
      },
    });

    const rackC1 = await prisma.rackLocation.upsert({
      where: { name: 'Rak-C1-03' },
      update: {},
      create: {
        name: 'Rak-C1-03',
        description: 'Rak tengah, baris pertama',
      },
    });

    console.log('Demo rack locations created:');
    console.log('- Location 1:', rackA1.name);
    console.log('- Location 2:', rackB1.name);
    console.log('- Location 3:', rackC1.name);

    // Create demo products
    const product1 = await prisma.product.upsert({
      where: { sku: 'ELEC-001' },
      update: {},
      create: {
        name: 'Smartphone ABC',
        sku: 'ELEC-001',
        categoryId: electronicsCategory.id,
        description: 'Smartphone terbaru dengan fitur canggih',
        price: 3500000,
        stock: 50,
        minStock: 10,
        userId: adminUser.id,
        rackLocationId: rackA1.id,
      },
    });

    const product2 = await prisma.product.upsert({
      where: { sku: 'CLTH-001' },
      update: {},
      create: {
        name: 'Kemeja Lengan Panjang',
        sku: 'CLTH-001',
        categoryId: clothingCategory.id,
        description: 'Kemeja formal lengan panjang',
        price: 150000,
        stock: 100,
        minStock: 20,
        userId: adminUser.id,
        rackLocationId: rackB1.id,
      },
    });

    const product3 = await prisma.product.upsert({
      where: { sku: 'FOOD-001' },
      update: {},
      create: {
        name: 'Indomie Goreng',
        sku: 'FOOD-001',
        categoryId: foodCategory.id,
        description: 'Mie instan rasa goreng',
        price: 3000,
        stock: 200,
        minStock: 50,
        userId: adminUser.id,
        rackLocationId: rackC1.id,
      },
    });

    console.log('Demo products created:');
    console.log('- Product 1:', product1.name);
    console.log('- Product 2:', product2.name);
    console.log('- Product 3:', product3.name);

    // Create a sample order with items
    const sampleOrder = await prisma.order.upsert({
      where: { orderId: 'ORD-2024-001' },
      update: {},
      create: {
        orderId: 'ORD-2024-001',
        status: 'processing',
        totalAmount: (3500000 * 2) + (150000 * 3),
        userId: adminUser.id,
        orderItems: {
          create: [
            { productId: product1.id, quantity: 2, price: 3500000 },
            { productId: product2.id, quantity: 3, price: 150000 },
          ],
        },
      },
    });

    console.log('Sample order created:', sampleOrder.orderId);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoData();
