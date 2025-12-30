/**
 * Script untuk membuat user admin pertama
 * Run with: node scripts/create-admin.js
 */

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const username = process.argv[2] || 'admin';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'Administrator';
    const email = process.argv[5] || 'admin@sikat.local';

    console.log('Creating admin user...');
    console.log('Username:', username);
    console.log('Email:', email);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create or update admin user
    const admin = await prisma.user.upsert({
      where: { username },
      update: {
        password: hashedPassword,
        name,
        email,
      },
      create: {
        username,
        password: hashedPassword,
        name,
        email,
        role: 'admin',
      },
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('ID:', admin.id);
    console.log('Username:', admin.username);
    console.log('Name:', admin.name);
    console.log('Email:', admin.email);
    console.log('\n🔐 Login credentials:');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('\n⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
