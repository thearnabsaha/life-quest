import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: 'Health', icon: '❤️', color: '#ff2d95', subCategories: ['Gym', 'Arms', 'Chest', 'Legs', 'Back', 'Core', 'Marathon', 'Steps', 'Sleep'] },
  { name: 'Studies', icon: '📚', color: '#00d4ff', subCategories: ['German Language', 'Office Work'] },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'hunter@lifequest.dev' },
    update: {},
    create: {
      email: 'hunter@lifequest.dev',
      passwordHash,
      profile: {
        create: {
          displayName: 'Shadow Monarch',
          level: 1,
          totalXP: 0,
          rank: 'E',
          title: 'Novice Hunter',
        },
      },
    },
  });

  // Create default categories with subcategories
  for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
    const cat = DEFAULT_CATEGORIES[i];
    await prisma.category.create({
      data: {
        userId: user.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        sortOrder: i,
        subCategories: {
          create: cat.subCategories.map((name, j) => ({
            name,
            sortOrder: j,
          })),
        },
      },
    });
  }

  console.log('✅ Seed complete!');
  console.log(`   User: hunter@lifequest.dev / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
