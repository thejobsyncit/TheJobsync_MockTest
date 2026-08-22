import exceljs from 'exceljs';

async function checkExcel() {
  const workbook = new exceljs.Workbook();
  await workbook.xlsx.readFile('JobSync_All_114_Roles_3420_Tough_MCQs_Tough_Coding.xlsx');
  const worksheet = workbook.worksheets[0];
  
  for(let i=2; i<=5; i++) {
    const row = worksheet.getRow(i);
    console.log(`Row ${i}: Role=${row.getCell(1).value}, Section=${row.getCell(2).value}, Diff=${row.getCell(10).value}, Q=${row.getCell(4).value?.toString().substring(0,20)}...`);
  }
}
checkExcel().catch(console.error);
