import { PrismaClient } from '@prisma/client';

// Singleton pour l'instance Prisma
const prisma = new PrismaClient();

export default prisma;
