// Utility to scan a PDF for signature fields and return bounding boxes using pdfjs-dist
import { getDocument } from 'pdfjs-dist';

// Keywords that commonly indicate a signature field
const SIGNATURE_KEYWORDS = [
  'signature',
  'sign here',
  'sign',
  'signed by',
  'signer',
  'signatory',
  'firma',
  'unterschrift',
  'signature du client',
  'signed'
];

// Function to detect signature fields in a PDF
export async function findSignatureFields(pdfUrl: string): Promise<Array<{ page: number, x: number, y: number, width: number, height: number }>> {
  const loadingTask = getDocument(pdfUrl);
  const pdf = await loadingTask.promise;
  const signatureFields: Array<{ page: number, x: number, y: number, width: number, height: number }> = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const { width, height } = page.getViewport({ scale: 1.0 });
    
    // First pass: look for explicit signature keywords
    textContent.items.forEach((item: any) => {
      const text = item.str.toLowerCase();
      
      if (SIGNATURE_KEYWORDS.some(keyword => text.includes(keyword))) {
        // Get the transform values from the text item
        // item.transform: [scaleX, skewX, skewY, scaleY, x, y] - where x, y is the bottom-left corner
        const x = item.transform[4];
        const y = item.transform[5];
        const itemWidth = item.width || 100;
        const itemHeight = item.height || 30;
        
        // Add some space around the signature keyword to create a larger target area
        // We place the signature area below the text indicating where to sign
        signatureFields.push({
          page: pageNum,
          x: x,
          y: y - itemHeight,  // Move up to position signature below the text
          width: Math.max(itemWidth, 150),  // Ensure reasonable minimum width
          height: 50  // Reasonable height for a signature field
        });
      }
    });
    
    // Second pass: look for form fields or blank lines that might be signature lines
    // This would require a more complex analysis of the PDF structure
    // For simplicity, we'll just look for horizontal lines that could be signature lines
    // This would require extracting operators from the PDF content stream
    // As a simplified approach, we'll just suggest a default signature position if none found
    
    if (signatureFields.filter(field => field.page === pageNum).length === 0) {
      // No explicit signature fields found on this page, check for common positions
      // Common positions: bottom of the page, just above footer area
      
      // Default position at the bottom of the page
      if (pageNum === pdf.numPages) {  // Only for the last page
        signatureFields.push({
          page: pageNum,
          x: width * 0.1,  // 10% from left margin
          y: height * 0.2,  // 20% from bottom
          width: width * 0.4,  // 40% of page width
          height: 60
        });
      }
    }
  }
  
  return signatureFields;
}