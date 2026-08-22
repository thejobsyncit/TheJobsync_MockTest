import exceljs from 'exceljs';

async function checkExcel() {
  const workbook = new exceljs.Workbook();
  console.log("Loading workbook...");
  await workbook.xlsx.readFile('JobSync_All_114_Roles_3420_Tough_MCQs_Tough_Coding.xlsx');
  const worksheet = workbook.worksheets[0];
  const firstRow = worksheet.getRow(1);
  console.log("Headers:");
  firstRow.eachCell((cell, colNumber) => {
    console.log(`Column ${colNumber}: ${cell.value}`);
  });
}
checkExcel().catch(console.error);
