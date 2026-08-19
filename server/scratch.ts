import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    const generatedId = `COL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    console.log("Using ID:", generatedId);
    const newCollege = await prisma.college.create({
      data: {
        college_id: generatedId,
        college_name: 'Deploy Test',
        college_code: '9999',
        location: 'test',
        contact_person: 'test',
        contact_email: '',
        contact_phone: '123'
      }
    });
    console.log("Success:", newCollege);
  } catch (err) {
    console.error("Prisma error:", err);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
