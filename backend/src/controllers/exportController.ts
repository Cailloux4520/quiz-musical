import { Response } from 'express';
import ExcelJS from 'exceljs';
import puppeteer from 'puppeteer';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

/**
 * Générer un template HTML pour le PDF de résultats
 */
const generatePDFTemplate = (sessionData: any): string => {
  const { session, players, teams, questions } = sessionData;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Résultats - ${session.quiz.title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', sans-serif;
      padding: 40px;
      color: #1f2937;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #9333ea;
    }
    .header h1 {
      font-size: 32px;
      color: #9333ea;
      margin-bottom: 10px;
    }
    .header .subtitle {
      font-size: 18px;
      color: #6b7280;
    }
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 24px;
      color: #9333ea;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    .info-item {
      padding: 10px;
      background: #f9fafb;
      border-radius: 5px;
    }
    .info-label {
      font-weight: bold;
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
    }
    .info-value {
      font-size: 18px;
      color: #1f2937;
      margin-top: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th {
      background: #9333ea;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:nth-child(even) {
      background: #f9fafb;
    }
    .podium {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin: 30px 0;
    }
    .podium-item {
      text-align: center;
      padding: 20px;
      border-radius: 10px;
      min-width: 150px;
    }
    .podium-1 {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      color: white;
      transform: scale(1.1);
    }
    .podium-2 {
      background: linear-gradient(135deg, #d1d5db, #9ca3af);
      color: white;
    }
    .podium-3 {
      background: linear-gradient(135deg, #fb923c, #f97316);
      color: white;
    }
    .podium-rank {
      font-size: 48px;
      font-weight: bold;
    }
    .podium-name {
      font-size: 18px;
      margin: 10px 0;
    }
    .podium-score {
      font-size: 24px;
      font-weight: bold;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <!-- En-tête -->
  <div class="header">
    <h1>🎵 ${session.quiz.title}</h1>
    <div class="subtitle">Résultats de la session - ${new Date(
      session.createdAt
    ).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })}</div>
  </div>

  <!-- Informations générales -->
  <div class="section">
    <h2 class="section-title">📊 Informations Générales</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Code de session</div>
        <div class="info-value">${session.inviteCode}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Nombre de joueurs</div>
        <div class="info-value">${players.length}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Nombre d'équipes</div>
        <div class="info-value">${teams.length}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Nombre de questions</div>
        <div class="info-value">${questions.length}</div>
      </div>
    </div>
  </div>

  <!-- Podium -->
  ${
    players.length >= 3
      ? `
  <div class="section">
    <h2 class="section-title">🏆 Podium</h2>
    <div class="podium">
      <div class="podium-item podium-2">
        <div class="podium-rank">2</div>
        <div class="podium-name">${players[1].nickname}</div>
        <div class="podium-score">${players[1].score} pts</div>
      </div>
      <div class="podium-item podium-1">
        <div class="podium-rank">1</div>
        <div class="podium-name">${players[0].nickname}</div>
        <div class="podium-score">${players[0].score} pts</div>
      </div>
      <div class="podium-item podium-3">
        <div class="podium-rank">3</div>
        <div class="podium-name">${players[2].nickname}</div>
        <div class="podium-score">${players[2].score} pts</div>
      </div>
    </div>
  </div>
  `
      : ''
  }

  <!-- Classement complet -->
  <div class="section">
    <h2 class="section-title">👥 Classement Complet</h2>
    <table>
      <thead>
        <tr>
          <th>Rang</th>
          <th>Pseudo</th>
          <th>Score</th>
          <th>Bonnes</th>
          <th>Mauvaises</th>
          <th>Équipe</th>
        </tr>
      </thead>
      <tbody>
        ${players
          .map(
            (player: any, index: number) => `
          <tr>
            <td><strong>${index + 1}</strong></td>
            <td>${player.nickname}</td>
            <td><strong>${player.score}</strong></td>
            <td style="color: #10b981;">${player.correctCount}</td>
            <td style="color: #ef4444;">${player.wrongCount}</td>
            <td>${player.team?.name || 'Solo'}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  </div>

  ${
    teams.length > 0
      ? `
  <!-- Classement Équipes -->
  <div class="section">
    <h2 class="section-title">👥 Classement Équipes</h2>
    <table>
      <thead>
        <tr>
          <th>Rang</th>
          <th>Équipe</th>
          <th>Score</th>
          <th>Joueurs</th>
        </tr>
      </thead>
      <tbody>
        ${teams
          .map(
            (team: any, index: number) => `
          <tr>
            <td><strong>${index + 1}</strong></td>
            <td>${team.name}</td>
            <td><strong>${team.score}</strong></td>
            <td>${team.players.map((p: any) => p.nickname).join(', ')}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  </div>
  `
      : ''
  }

  <!-- Statistiques par question -->
  <div class="section">
    <h2 class="section-title">❓ Statistiques par Question</h2>
    <table>
      <thead>
        <tr>
          <th>N°</th>
          <th>Question</th>
          <th>Type</th>
          <th>Réponses</th>
          <th>% Réussite</th>
        </tr>
      </thead>
      <tbody>
        ${questions
          .map((question: any, index: number) => {
            const answers = players.flatMap((p: any) =>
              p.answers.filter((a: any) => a.questionId === question.id)
            );
            const correctAnswers = answers.filter((a: any) => a.isCorrect).length;
            const successRate =
              answers.length > 0
                ? Math.round((correctAnswers / answers.length) * 100)
                : 0;

            return `
          <tr>
            <td>${index + 1}</td>
            <td>${question.question}</td>
            <td>${question.type}</td>
            <td>${correctAnswers} / ${answers.length}</td>
            <td style="color: ${successRate >= 50 ? '#10b981' : '#ef4444'};">
              <strong>${successRate}%</strong>
            </td>
          </tr>
        `;
          })
          .join('')}
      </tbody>
    </table>
  </div>

  <!-- Footer -->
  <div class="footer">
    Généré par Quiz Musical - ${new Date().toLocaleString('fr-FR')}
  </div>
</body>
</html>
  `;
};

/**
 * Export des résultats d'une session en PDF
 * GET /api/session/:id/export/pdf
 */
export const exportSessionToPDF = async (req: AuthRequest, res: Response) => {
  let browser;
  try {
    const { id: sessionId } = req.params;
    const userId = req.user!.userId;

    // Récupérer la session avec toutes les données
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        quiz: {
          userId,
        },
      },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        players: {
          include: {
            team: true,
            answers: {
              include: {
                question: true,
              },
            },
          },
          orderBy: { score: 'desc' },
        },
        teams: {
          include: {
            players: true,
          },
          orderBy: { score: 'desc' },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    // Générer le template HTML
    const htmlContent = generatePDFTemplate({
      session,
      players: session.players,
      teams: session.teams,
      questions: session.quiz.questions,
    });

    // Lancer puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Générer le PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    await browser.close();

    // Envoyer le fichier PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="resultats-${session.quiz.title.replace(
        /[^a-z0-9]/gi,
        '_'
      )}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Erreur exportSessionToPDF:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export PDF' });
  }
};

/**
 * Export des résultats d'une session en Excel (multi-feuilles)
 * GET /api/session/:id/export/excel
 */
export const exportSessionToExcel = async (req: AuthRequest, res: Response) => {
  try {
    const { id: sessionId } = req.params;
    const userId = req.user!.userId;

    // Récupérer la session avec toutes les données
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        quiz: {
          userId, // Vérifier que le quiz appartient à l'utilisateur
        },
      },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        players: {
          include: {
            team: true,
            answers: {
              include: {
                question: true,
              },
            },
          },
          orderBy: { score: 'desc' },
        },
        teams: {
          include: {
            players: true,
          },
          orderBy: { score: 'desc' },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    // Créer un nouveau classeur Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Quiz Musical';
    workbook.created = new Date();

    // ===== FEUILLE 1: RÉSUMÉ =====
    const summarySheet = workbook.addWorksheet('Résumé');
    
    summarySheet.columns = [
      { key: 'label', width: 30 },
      { key: 'value', width: 50 },
    ];

    summarySheet.addRows([
      { label: 'Quiz', value: session.quiz.title },
      { label: 'Code de session', value: session.inviteCode },
      { label: 'Statut', value: session.status },
      { label: 'Date de création', value: session.createdAt.toLocaleString('fr-FR') },
      { label: '' },
      { label: 'Nombre de joueurs', value: session.players.length },
      { label: 'Nombre d\'équipes', value: session.teams.length },
      { label: 'Nombre de questions', value: session.quiz.questions.length },
      { label: '' },
      {
        label: 'Score moyen',
        value:
          session.players.length > 0
            ? Math.round(
                session.players.reduce((sum, p) => sum + p.score, 0) /
                  session.players.length
              )
            : 0,
      },
      {
        label: 'Score maximum',
        value: session.players.length > 0 ? session.players[0].score : 0,
      },
    ]);

    // Style pour le résumé
    summarySheet.getRow(1).font = { bold: true, size: 12 };
    summarySheet.getColumn(1).font = { bold: true };

    // ===== FEUILLE 2: CLASSEMENT JOUEURS =====
    const playersSheet = workbook.addWorksheet('Classement Joueurs');

    playersSheet.columns = [
      { header: 'Rang', key: 'rank', width: 10 },
      { header: 'Pseudo', key: 'nickname', width: 25 },
      { header: 'Score', key: 'score', width: 12 },
      { header: 'Bonnes réponses', key: 'correct', width: 18 },
      { header: 'Mauvaises réponses', key: 'wrong', width: 20 },
      { header: 'Équipe', key: 'team', width: 25 },
    ];

    session.players.forEach((player, index) => {
      playersSheet.addRow({
        rank: index + 1,
        nickname: player.nickname,
        score: player.score,
        correct: player.correctCount,
        wrong: player.wrongCount,
        team: player.team?.name || 'Solo',
      });
    });

    // Style pour l'en-tête
    const playersHeaderRow = playersSheet.getRow(1);
    playersHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    playersHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF9333EA' },
    };
    playersHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // ===== FEUILLE 3: CLASSEMENT ÉQUIPES =====
    if (session.teams.length > 0) {
      const teamsSheet = workbook.addWorksheet('Classement Équipes');

      teamsSheet.columns = [
        { header: 'Rang', key: 'rank', width: 10 },
        { header: 'Équipe', key: 'name', width: 25 },
        { header: 'Score', key: 'score', width: 12 },
        { header: 'Nombre de joueurs', key: 'playerCount', width: 20 },
        { header: 'Joueurs', key: 'players', width: 50 },
      ];

      session.teams.forEach((team, index) => {
        teamsSheet.addRow({
          rank: index + 1,
          name: team.name,
          score: team.score,
          playerCount: team.players.length,
          players: team.players.map((p) => p.nickname).join(', '),
        });
      });

      // Style pour l'en-tête
      const teamsHeaderRow = teamsSheet.getRow(1);
      teamsHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      teamsHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF9333EA' },
      };
      teamsHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
    }

    // ===== FEUILLE 4: DÉTAIL QUESTIONS =====
    const questionsSheet = workbook.addWorksheet('Détail Questions');

    questionsSheet.columns = [
      { header: 'N°', key: 'number', width: 8 },
      { header: 'Question', key: 'question', width: 40 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Bonne réponse', key: 'correctAnswer', width: 20 },
      { header: 'Réponses totales', key: 'totalAnswers', width: 18 },
      { header: 'Bonnes réponses', key: 'correctAnswers', width: 18 },
      { header: '% de réussite', key: 'successRate', width: 15 },
    ];

    session.quiz.questions.forEach((question, index) => {
      const answers = session.players.flatMap((p) =>
        p.answers.filter((a) => a.questionId === question.id)
      );
      const correctAnswers = answers.filter((a) => a.isCorrect).length;

      questionsSheet.addRow({
        number: index + 1,
        question: question.question,
        type: question.type,
        correctAnswer: question.choices[question.correctIndex],
        totalAnswers: answers.length,
        correctAnswers,
        successRate:
          answers.length > 0
            ? `${Math.round((correctAnswers / answers.length) * 100)}%`
            : '0%',
      });
    });

    // Style pour l'en-tête
    const questionsHeaderRow = questionsSheet.getRow(1);
    questionsHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    questionsHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' },
    };
    questionsHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // ===== FEUILLE 5: MATRICE RÉPONSES =====
    const matrixSheet = workbook.addWorksheet('Matrice Réponses');

    // En-têtes de colonnes
    const matrixColumns: any[] = [
      { header: 'Joueur', key: 'player', width: 25 },
    ];

    session.quiz.questions.forEach((q, index) => {
      matrixColumns.push({
        header: `Q${index + 1}`,
        key: `q${index}`,
        width: 8,
      });
    });
    matrixColumns.push({ header: 'Score Total', key: 'totalScore', width: 12 });

    matrixSheet.columns = matrixColumns;

    // Données des joueurs
    session.players.forEach((player) => {
      const row: any = { player: player.nickname };

      session.quiz.questions.forEach((question, qIndex) => {
        const answer = player.answers.find((a) => a.questionId === question.id);
        if (answer) {
          row[`q${qIndex}`] = answer.isCorrect ? '✓' : '✗';
        } else {
          row[`q${qIndex}`] = '-';
        }
      });

      row.totalScore = player.score;
      matrixSheet.addRow(row);
    });

    // Style pour l'en-tête
    const matrixHeaderRow = matrixSheet.getRow(1);
    matrixHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    matrixHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' },
    };
    matrixHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Générer le fichier Excel
    const buffer = await workbook.xlsx.writeBuffer();

    // Envoyer le fichier
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="resultats-${session.quiz.title.replace(
        /[^a-z0-9]/gi,
        '_'
      )}.xlsx"`
    );
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Erreur exportSessionToExcel:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export Excel' });
  }
};

/**
 * Export des résultats d'une session en CSV
 * GET /api/session/:id/export/csv
 */
export const exportSessionToCSV = async (req: AuthRequest, res: Response) => {
  try {
    const { id: sessionId } = req.params;
    const userId = req.user!.userId;

    // Récupérer la session avec les joueurs
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        quiz: {
          userId,
        },
      },
      include: {
        quiz: {
          select: {
            title: true,
          },
        },
        players: {
          include: {
            team: true,
          },
          orderBy: { score: 'desc' },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    // Créer le CSV
    const csvHeader = 'Rang,Pseudo,Score,Bonnes,Mauvaises,Équipe\n';
    const csvRows = session.players
      .map(
        (player, index) =>
          `${index + 1},"${player.nickname}",${player.score},${
            player.correctCount
          },${player.wrongCount},"${player.team?.name || 'Solo'}"`
      )
      .join('\n');

    const csv = csvHeader + csvRows;

    // Envoyer le fichier CSV
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="resultats-${session.quiz.title.replace(
        /[^a-z0-9]/gi,
        '_'
      )}.csv"`
    );
    res.send('\uFEFF' + csv); // BOM UTF-8 pour Excel
  } catch (error) {
    console.error('Erreur exportSessionToCSV:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export CSV' });
  }
};
