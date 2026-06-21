import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  console.log('🔑 Réinitialisation du mot de passe admin...');

  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Vérifier si l'admin existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@quiz.com' },
    });

    if (existingAdmin) {
      // Mettre à jour le mot de passe
      await prisma.user.update({
        where: { email: 'admin@quiz.com' },
        data: {
          password: hashedPassword,
        },
      });
      console.log('✅ Mot de passe admin réinitialisé avec succès !');
    } else {
      // Créer l'utilisateur admin
      await prisma.user.create({
        data: {
          email: 'admin@quiz.com',
          password: hashedPassword,
          name: 'Admin Quiz Musical',
        },
      });
      console.log('✅ Utilisateur admin créé avec succès !');
    }

    console.log('\n📧 Email: admin@quiz.com');
    console.log('🔒 Mot de passe: admin123');
    console.log('\n⚠️  IMPORTANT: Changez ce mot de passe après connexion !');
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
