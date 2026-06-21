import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Créer un utilisateur admin par défaut
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@quiz.com' },
    update: {},
    create: {
      email: 'admin@quiz.com',
      password: hashedPassword,
      name: 'Admin Quiz Musical',
    },
  });

  console.log('✅ Admin créé:', admin.email);

  // Créer un quiz de démonstration
  const demoQuiz = await prisma.quiz.create({
    data: {
      title: 'Quiz Années 80',
      description: 'Testez vos connaissances sur les hits des années 80 !',
      theme: 'retro',
      userId: admin.id,
      questions: {
        create: [
          {
            order: 1,
            type: 'text',
            content: 'Quel groupe a chanté "Take On Me" en 1985 ?',
            choices: ['A-ha', 'Duran Duran', 'The Police', 'Depeche Mode'],
            correctIndex: 0,
            timeLimit: 30,
            points: 1000,
          },
          {
            order: 2,
            type: 'text',
            content: 'Quelle chanteuse a sorti "Like a Prayer" en 1989 ?',
            choices: ['Whitney Houston', 'Madonna', 'Cyndi Lauper', 'Janet Jackson'],
            correctIndex: 1,
            timeLimit: 30,
            points: 1000,
          },
          {
            order: 3,
            type: 'text',
            content: 'Quel est le titre du premier album de Michael Jackson chez Epic Records ?',
            choices: ['Bad', 'Thriller', 'Off the Wall', 'Dangerous'],
            correctIndex: 2,
            timeLimit: 30,
            points: 1000,
          },
        ],
      },
    },
  });

  console.log('✅ Quiz de démo créé:', demoQuiz.title);
  console.log('✨ Seeding terminé !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
