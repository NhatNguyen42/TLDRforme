const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const articles = await prisma.article.deleteMany();
  console.log('Deleted', articles.count, 'articles');
  const logs = await prisma.scrapeLog.deleteMany();
  console.log('Deleted', logs.count, 'scrape logs');
  await prisma.$disconnect();
}

main().catch(console.error);
