// Mock email service for development - no external dependencies required
// In production, replace with actual email service like Resend, SendGrid, etc.

export interface EmailVerificationData {
  email: string;
  firstName: string;
  verificationToken: string;
  verificationUrl: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Generic send email function
export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  const sender = from || process.env.EMAIL_FROM || 'noreply@pulsecrm.com';
  
  try {
    // Check if we have Resend API key
    if (process.env.RESEND_API_KEY && process.env.NODE_ENV === 'production') {
      // Use Resend in production if configured
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const result = await resend.emails.send({
        from: sender,
        to,
        subject,
        html
      });
      
      return { success: true, messageId: result.id };
    } else {
      // Development mode - just log the email
      console.log(`📧 [DEV] Email sent to: ${to}`);
      console.log(`📋 Subject: ${subject}`);
      console.log(`📝 Content: ${html.substring(0, 150)}...`);
      
      return { success: true, messageId: `dev-mode-${Date.now()}` };
    }
  } catch (error) {
    console.error('Email service error:', error);
    throw new Error('Failed to send email');
  }
}

export async function sendVerificationEmail({
  email,
  firstName,
  verificationUrl
}: Omit<EmailVerificationData, 'verificationToken'>) {
  try {
    await sendEmail({
      to: email,
      subject: 'Verify your Pulse CRM account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verify Your Email</h2>
          <p>Hello${firstName ? ` ${firstName}` : ''},</p>
          <p>Thank you for registering with Pulse CRM. Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p>If you did not create an account, you can safely ignore this email.</p>
        </div>
      `
    });
    
    // Log for development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ In development mode, user registration is auto-verified`);
    }

    return { success: true, messageId: 'email-verification' };
  } catch (error) {
    console.error('Email verification error:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendPasswordResetEmail({
  email,
  firstName,
  resetUrl
}: {
  email: string;
  firstName: string;
  resetUrl: string;
}) {
  try {
    await sendEmail({
      to: email,
      subject: 'Reset your Pulse CRM password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p>Hello${firstName ? ` ${firstName}` : ''},</p>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `
    });

    return { success: true, messageId: 'password-reset' };
  } catch (error) {
    console.error('Password reset email error:', error);
    throw new Error('Failed to send password reset email');
  }
}

export async function sendSignatureRequestEmail({
  email,
  name,
  documentName,
  signingUrl,
  expiryDate
}: {
  email: string;
  name?: string;
  documentName: string;
  signingUrl: string;
  expiryDate?: Date;
}) {
  try {
    const expiryMessage = expiryDate 
      ? `<p>This signature request will expire on ${expiryDate.toLocaleDateString()}.</p>` 
      : '';

    await sendEmail({
      to: email,
      subject: `Please sign: ${documentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Document Signature Request</h2>
          <p>Hello${name ? ` ${name}` : ''},</p>
          <p>You have received a request to sign the document: <strong>${documentName}</strong></p>
          <p>Please click the button below to review and sign the document:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${signingUrl}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Review & Sign Document
            </a>
          </div>
          ${expiryMessage}
          <p>If you have any questions, please contact the sender directly.</p>
          <hr style="border: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #666; font-size: 12px;">
            This is an automated message from Pulse CRM. Please do not reply to this email.
          </p>
        </div>
      `
    });

    return { success: true, messageId: 'signature-request' };
  } catch (error) {
    console.error('Signature request email error:', error);
    throw new Error('Failed to send signature request email');
  }
}

export async function sendSignatureCompletedEmail({
  email,
  name,
  documentName,
  signedBy,
  downloadUrl
}: {
  email: string;
  name?: string;
  documentName: string;
  signedBy: string;
  downloadUrl?: string;
}) {
  try {
    const downloadButton = downloadUrl 
      ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${downloadUrl}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Download Signed Document
          </a>
        </div>
      ` 
      : '';

    await sendEmail({
      to: email,
      subject: `Document signed: ${documentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Document Successfully Signed</h2>
          <p>Hello${name ? ` ${name}` : ''},</p>
          <p>The document <strong>${documentName}</strong> has been signed by <strong>${signedBy}</strong>.</p>
          ${downloadButton}
          <p>You can view and download the signed document from your Pulse CRM dashboard.</p>
          <hr style="border: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #666; font-size: 12px;">
            This is an automated message from Pulse CRM. Please do not reply to this email.
          </p>
        </div>
      `
    });

    return { success: true, messageId: 'signature-completed' };
  } catch (error) {
    console.error('Signature completed email error:', error);
    throw new Error('Failed to send signature completed email');
  }
}
