import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailVerificationData {
    email: string;
    firstName: string;
    verificationToken: string;
    verificationUrl: string;
}

export async function sendVerificationEmail({
    email,
    firstName,
    verificationUrl
}: Omit<EmailVerificationData, 'verificationToken'>) {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL || 'ConstructFlow <onboarding@constructflow.com>',
            to: [email],
            subject: 'Verify your ConstructFlow account',
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify your ConstructFlow account</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ConstructFlow!</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <h2 style="color: #333; margin-top: 0;">Hi ${firstName}!</h2>
              
              <p style="font-size: 16px; margin-bottom: 25px;">
                Thank you for signing up for ConstructFlow. To complete your registration and start managing your construction projects, please verify your email address.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: bold; 
                          font-size: 16px; 
                          display: inline-block;
                          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                  Verify Email Address
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 25px;">
                If the button doesn't work, you can copy and paste this link into your browser:
              </p>
              <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 14px;">
                ${verificationUrl}
              </p>
              
              <hr style="border: none; border-top: 1px solid #e9ecef; margin: 25px 0;">
              
              <p style="color: #666; font-size: 12px; margin-bottom: 0;">
                This verification link will expire in 24 hours. If you didn't create an account with ConstructFlow, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
            text: `
        Welcome to ConstructFlow!
        
        Hi ${firstName}!
        
        Thank you for signing up for ConstructFlow. To complete your registration and start managing your construction projects, please verify your email address.
        
        Click here to verify your email: ${verificationUrl}
        
        This verification link will expire in 24 hours. If you didn't create an account with ConstructFlow, you can safely ignore this email.
        
        Best regards,
        The ConstructFlow Team
      `
        });

        if (error) {
            console.error('Email sending error:', error);
            throw new Error(`Failed to send verification email: ${error.message}`);
        }

        return { success: true, messageId: data?.id };
    } catch (error) {
        console.error('Email service error:', error);
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
        const { data, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL || 'ConstructFlow <noreply@constructflow.com>',
            to: [email],
            subject: 'Reset your ConstructFlow password',
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset your ConstructFlow password</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <h2 style="color: #333; margin-top: 0;">Hi ${firstName}!</h2>
              
              <p style="font-size: 16px; margin-bottom: 25px;">
                We received a request to reset your ConstructFlow password. Click the button below to set a new password.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: bold; 
                          font-size: 16px; 
                          display: inline-block;
                          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 25px;">
                If the button doesn't work, you can copy and paste this link into your browser:
              </p>
              <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 14px;">
                ${resetUrl}
              </p>
              
              <hr style="border: none; border-top: 1px solid #e9ecef; margin: 25px 0;">
              
              <p style="color: #666; font-size: 12px; margin-bottom: 0;">
                This password reset link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
            text: `
        Password Reset
        
        Hi ${firstName}!
        
        We received a request to reset your ConstructFlow password. Click the link below to set a new password:
        
        ${resetUrl}
        
        This password reset link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        
        Best regards,
        The ConstructFlow Team
      `
        });

        if (error) {
            console.error('Email sending error:', error);
            throw new Error(`Failed to send password reset email: ${error.message}`);
        }

        return { success: true, messageId: data?.id };
    } catch (error) {
        console.error('Email service error:', error);
        throw new Error('Failed to send password reset email');
    }
} 