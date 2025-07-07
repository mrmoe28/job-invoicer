import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import nodemailer from 'nodemailer';

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SignatureData {
  userId: string;
  imageUrl: string;
  page: number;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  signedAt: string;
  name?: string;
  email?: string;
}

interface EmailRecipient {
  email: string;
  name?: string;
  type: 'signer' | 'cc' | 'bcc';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get('pdf') as File;
    const signaturesJson = formData.get('signatures') as string;
    const documentName = formData.get('documentName') as string;
    const recipientsJson = formData.get('recipients') as string | null;
    const emailSubject = formData.get('emailSubject') as string | null;
    const emailBody = formData.get('emailBody') as string | null;
    
    if (!pdfFile || !signaturesJson) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const signatures: SignatureData[] = JSON.parse(signaturesJson);
    const recipients: EmailRecipient[] = recipientsJson ? JSON.parse(recipientsJson) : [];
    
    // Load the PDF
    const pdfBytes = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Add metadata
    pdfDoc.setTitle(`Signed: ${documentName}`);
    pdfDoc.setAuthor('ConstructFlow Document Management');
    pdfDoc.setSubject('Signed Document');
    pdfDoc.setKeywords(['signed', 'document', 'constructflow']);
    
    // Get a standard font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Process each signature
    for (const signature of signatures) {
      const page = pdfDoc.getPage(signature.page - 1); // Pages are 0-indexed
      const { width, height } = page.getSize();
      
      // Calculate actual position and size
      const x = (signature.xPercent / 100) * width;
      const y = height - ((signature.yPercent / 100) * height); // PDF coordinates are bottom-up
      const sigWidth = (signature.widthPercent / 100) * width;
      
      // Convert base64 image to buffer
      const imageData = signature.imageUrl.split(',')[1];
      const imageBytes = Buffer.from(imageData, 'base64');
      
      // Embed the image
      let image;
      if (signature.imageUrl.includes('image/png')) {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        image = await pdfDoc.embedJpg(imageBytes);
      }
      
      // Calculate aspect ratio
      const aspectRatio = image.width / image.height;
      const sigHeight = sigWidth / aspectRatio;
      
      // Draw the signature
      page.drawImage(image, {
        x: x,
        y: y - sigHeight, // Adjust for top-left origin
        width: sigWidth,
        height: sigHeight,
      });
      
      // Add timestamp and signer info
      const timestampText = `Signed: ${new Date(signature.signedAt).toLocaleString()}`;
      const signerText = signature.name ? `By: ${signature.name}` : '';
      
      // Add timestamp below signature
      page.drawText(timestampText, {
        x: x,
        y: y - sigHeight - 15,
        size: 8,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.4),
      });
      
      // Add signer name if available
      if (signerText) {
        page.drawText(signerText, {
          x: x,
          y: y - sigHeight - 25,
          size: 8,
          font: helveticaFont,
          color: rgb(0.4, 0.4, 0.4),
        });
      }
    }
    
    // Add certificate of completion on the last page
    const lastPage = pdfDoc.getPage(pdfDoc.getPageCount() - 1);
    const { width, height } = lastPage.getSize();
    
    // Draw certificate box at the bottom of the last page
    const boxY = 50;
    const boxHeight = 120;
    lastPage.drawRectangle({
      x: 50,
      y: boxY,
      width: width - 100,
      height: boxHeight,
      borderColor: rgb(0.9, 0.9, 0.9),
      borderWidth: 1,
      color: rgb(0.97, 0.97, 0.97),
    });
    
    lastPage.drawText('Certificate of Completion', {
      x: 70,
      y: boxY + boxHeight - 25,
      size: 14,
      font: helveticaBoldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    lastPage.drawText(`Document: ${documentName}`, {
      x: 70,
      y: boxY + boxHeight - 45,
      size: 10,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    const signersList = signatures
      .filter(s => s.name)
      .map(s => s.name)
      .join(', ');
    
    lastPage.drawText(`Signers: ${signersList || 'Document signed'}`, {
      x: 70,
      y: boxY + boxHeight - 65,
      size: 10,
      font: helveticaFont, 
      color: rgb(0.3, 0.3, 0.3),
    });
    
    lastPage.drawText(`Timestamp: ${new Date().toISOString()}`, {
      x: 70,
      y: boxY + boxHeight - 85,
      size: 10,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    lastPage.drawText('ConstructFlow Document Management System', {
      x: 70,
      y: boxY + 15,
      size: 8,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Save the modified PDF
    const signedPdfBytes = await pdfDoc.save();
    const signedPdfBuffer = Buffer.from(signedPdfBytes);
    
    // Determine recipients
    let recipientEmails: string[] = [];
    let ccEmails: string[] = [];
    let bccEmails: string[] = [];
    
    if (recipients.length > 0) {
      // Use provided recipients
      recipientEmails = recipients
        .filter(r => r.type === 'signer')
        .map(r => r.email);
      
      ccEmails = recipients
        .filter(r => r.type === 'cc')
        .map(r => r.email);
      
      bccEmails = recipients
        .filter(r => r.type === 'bcc')
        .map(r => r.email);
    } else {
      // Use default recipients
      const userEmail = process.env.DEFAULT_EMAIL || 'user@example.com';
      recipientEmails = process.env.RECIPIENT_EMAILS?.split(',') || [userEmail];
    }
    
    // Prepare email subject and body
    const subject = emailSubject || `Signed Document: ${documentName}`;
    const htmlBody = emailBody || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Document Signed Successfully</h2>
        <p>The following document has been signed and is attached to this email:</p>
        <p><strong>${documentName}</strong></p>
        <p>Signed on: ${new Date().toLocaleString()}</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This email was sent from ConstructFlow Document Management System.
        </p>
      </div>
    `;
    
    // Send email with the signed PDF
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@constructflow.com',
      to: recipientEmails,
      cc: ccEmails.length > 0 ? ccEmails : undefined,
      bcc: bccEmails.length > 0 ? bccEmails : undefined,
      subject: subject,
      text: `The document '${documentName}' has been signed and is attached to this email.`,
      html: htmlBody,
      attachments: [
        {
          filename: `Signed_${documentName}`,
          content: signedPdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };
    
    // Send the email
    await transporter.sendMail(mailOptions);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Document signed and emailed successfully',
      recipients: {
        to: recipientEmails,
        cc: ccEmails,
        bcc: bccEmails
      },
    });
    
  } catch (error) {
    console.error('Error processing signed PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process signed document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}