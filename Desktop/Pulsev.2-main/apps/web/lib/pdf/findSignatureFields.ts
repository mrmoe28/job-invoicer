// Utility to scan a PDF for the word 'Signature' and return bounding boxes using pdfjs-dist
import { getDocument } from 'pdfjs-dist';

export async function findSignatureFields(pdfUrl: string): Promise<Array<{ page: number, x: number, y: number, width: number, height: number }>> {
  const loadingTask = getDocument(pdfUrl);
  const pdf = await loadingTask.promise;
  const signatureFields: Array<{ page: number, x: number, y: number, width: number, height: number }> = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    textContent.items.forEach((item: any) => {
      if (item.str && item.str.toLowerCase().includes('signature')) {
        // item.transform: [a, b, c, d, e, f] => e, f is the bottom-left corner
        signatureFields.push({
          page: pageNum,
          x: item.transform[4],
          y: item.transform[5],
          width: item.width || 100,
          height: item.height || 30,
        });
      }
    });
  }
  return signatureFields;
}
