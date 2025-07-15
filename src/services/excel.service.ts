import { Service } from 'typedi';
import exceljs from 'exceljs';
import { S3ImageService } from './s3Image.service';

@Service()
export class ExcelService {
  constructor(private s3ImageService: S3ImageService) {}
  public async generateExcelFile(payload: Record<string, any>): Promise<any> {
    const workbook = new exceljs.Workbook();

    for (const sheetName in payload) {
      const sheetData = payload[sheetName];
      const worksheet = workbook.addWorksheet(sheetName);

      // Add column headers
      worksheet.columns = Object.keys(sheetData[0]).map(key => ({ header: key, key: key }));

      // Add rows to the worksheet
      sheetData.forEach(row => {
        const newRow = worksheet.addRow(row);
        newRow.getCell(2).value = this.stripHtmlTags(newRow.getCell(2).value); // Column index is 1 for the second column
        newRow.getCell(2).font = { bold: true };
      });

      // Set column widths based on the maximum length of content
      worksheet.columns.forEach(column => {
        const maxLength = Math.max(
          ...sheetData.map(row => {
            const value = row[column.key];
            // Determine the length based on the value type
            if (typeof value === 'boolean') {
              return value.toString().length + 6; // Use string length of "true" or "false"
            }
            return String(value || '').length; // Default case for other types
          }),
        );

        column.width = maxLength + 2; // Adding extra space
      });
    }

    // Write to a buffer or file
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer; // Return buffer for further processing (like saving to a file)
  }

  public async writeExcelFile(payload: any, fileName: string): Promise<any> {
    const workbook = new exceljs.Workbook();

    // Read the original Excel file
    // await workbook.xlsx.readFile(`${__dirname}/../assets/${fileName}`);

    await workbook.xlsx.load((await this.s3ImageService.getObject(fileName)) as any);

    Object.entries(payload).forEach(([sheetName, sheetData], index) => {
      const worksheet = workbook.worksheets.find(sheet => sheet.name === sheetName);

      const { answerTitleCell, rowHeader: rowHeaderIndex } = sheetData[0]; //will be same for whole sheet
      // Iterate through all rows starting from row 2
      worksheet.eachRow((row, rowNumber) => {
        // const myData = sheetData?.[rowNumber - 1]; //row start from 1 and index 0
        //index 1, row 2 row<index, hrd, 7thr , 6 index, start from 8th row, index 0

        const cell = row.getCell(answerTitleCell + 1);
        // const questionCell = row.getCell();  2, 2, 6, 7th row,7th geader
        if (rowNumber > rowHeaderIndex + 1) {
          const myData = sheetData?.[rowNumber - rowHeaderIndex - 2];
          if (!myData?.answerTitleCell) return undefined;
          //cell.value = `greatjob-${this.stripHtmlTags(myData.answer)}`;
          cell.value = this.stripHtmlTags(myData.answer);
          cell.alignment = {
            wrapText: true,
          };
        }
      }); // Write to a buffer or file
    });
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer; // Return buffer for further processing (like saving to a file)
  }

  private stripHtmlTags(htmlString) {
    return htmlString.replace(/<[^>]*>/g, '').replace(/`/g, '').trim();
  }
  
}
