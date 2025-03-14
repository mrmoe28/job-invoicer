const PDFDocument = require('pdfkit');
const fs = require('fs');

// Create residential-worksheet.pdf
const doc1 = new PDFDocument();
doc1.pipe(fs.createWriteStream('permithelper/public/forms/residential-worksheet.pdf'));
doc1.fontSize(25).text('Residential Worksheet', 100, 100);
doc1.fontSize(18).text('This is a placeholder PDF for the residential worksheet form.', 100, 150);
doc1.fontSize(12).text('For demonstration purposes only.', 100, 200);
doc1.end();

// Create building-permit-application.pdf
const doc2 = new PDFDocument();
doc2.pipe(fs.createWriteStream('permithelper/public/forms/building-permit-application.pdf'));
doc2.fontSize(25).text('Building Permit Application', 100, 100);
doc2.fontSize(18).text('This is a placeholder PDF for the building permit application form.', 100, 150);
doc2.fontSize(12).text('For demonstration purposes only.', 100, 200);
doc2.end();

console.log('PDF files created successfully.'); 