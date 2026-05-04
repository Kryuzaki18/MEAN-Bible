import { Injectable } from '@angular/core';

import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType } from 'docx';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1'): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(dataBlob, filename + '.xlsx');
  }

  exportToPDF(data: any[], filename: string): void {
    const doc = new jsPDF();
    const columns = Object.keys(data[0]);
    const rows = data.map(item => Object.values(item).map(val => String(val)));

    autoTable(doc, {
      head: [columns],
      body: rows,
    });
    doc.save(filename + '.pdf');
  }

  exportToWord(data: any[], filename: string): void {
    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: Object.keys(data[0]).map(key =>
            new TableCell({
              children: [new Paragraph(key)],
              width: { size: 100 / Object.keys(data[0]).length, type: WidthType.PERCENTAGE },
            })
          ),
        }),
        ...data.map(item =>
          new TableRow({
            children: Object.values(item).map(value =>
              new TableCell({
                children: [new Paragraph(String(value))],
                width: { size: 100 / Object.keys(data[0]).length, type: WidthType.PERCENTAGE },
              })
            ),
          })
        ),
      ],
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [table],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, filename + '.docx');
    });
  }
}