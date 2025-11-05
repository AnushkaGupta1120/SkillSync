const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('Email service not configured. Email features will be disabled.');
      return;
    }

    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Verify connection
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Email service connection failed:', error);
      } else {
        console.log('✅ Email service connected successfully');
      }
    });
  }

  async sendEmail({ to, subject, html, text }) {
    if (!this.transporter) {
      console.warn('Email service not available');
      return false;
    }

    try {
      const mailOptions = {
        from: `"SkillSync AI" <${process.env.SMTP_USER}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendWelcomeEmail(user) {
    const subject = 'Welcome to SkillSync AI!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to SkillSync AI, ${user.name}!</h1>
        <p>Thank you for joining our platform. We're excited to help you on your coding journey.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1e293b; margin-top: 0;">Get Started</h2>
          <ul style="color: #475569;">
            <li>Complete your profile to get personalized recommendations</li>
            <li>Start with our DSA practice arena</li>
            <li>Take mock interviews to prepare for real ones</li>
            <li>Upload your resume for AI-powered analysis</li>
          </ul>
        </div>
        
        <p>If you have any questions, feel free to reach out to our support team.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            Best regards,<br>
            The SkillSync AI Team
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Reset Your SkillSync AI Password';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Password Reset Request</h1>
        <p>Hi ${user.name},</p>
        <p>You requested to reset your password for your SkillSync AI account.</p>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e;">
            <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">
          This link will expire in 1 hour for security reasons.
        </p>
        
        <p style="color: #64748b; font-size: 14px;">
          If the button doesn't work, copy and paste this URL into your browser:<br>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  async sendInterviewScheduledEmail(candidate, interview) {
    const subject = 'Interview Scheduled - SkillSync AI';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Interview Scheduled</h1>
        <p>Hi ${candidate.name},</p>
        <p>Great news! An interview has been scheduled for you.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #0c4a6e; margin-top: 0;">Interview Details</h2>
          <ul style="color: #0c4a6e;">
            <li><strong>Type:</strong> ${interview.sessionType}</li>
            <li><strong>Date:</strong> ${new Date(interview.scheduledDate).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${new Date(interview.scheduledDate).toLocaleTimeString()}</li>
          </ul>
        </div>
        
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #065f46; margin-top: 0;">Preparation Tips</h3>
          <ul style="color: #065f46;">
            <li>Test your internet connection and audio setup</li>
            <li>Prepare examples from your experience</li>
            <li>Review the job description and company information</li>
            <li>Practice coding problems if it's a technical interview</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard/student" 
             style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Interview Details
          </a>
        </div>
        
        <p>Good luck with your interview!</p>
      </div>
    `;

    return await this.sendEmail({
      to: candidate.email,
      subject,
      html
    });
  }

  async sendResumeAnalysisCompleteEmail(user, analysis) {
    const subject = 'Your Resume Analysis is Ready!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Resume Analysis Complete</h1>
        <p>Hi ${user.name},</p>
        <p>Your resume analysis has been completed. Here's a quick summary:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: ${analysis.atsScore >= 80 ? '#059669' : analysis.atsScore >= 60 ? '#d97706' : '#dc2626'};">
                ${analysis.atsScore}%
              </div>
              <div style="color: #64748b; font-size: 14px;">ATS Score</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: ${analysis.overallScore >= 80 ? '#059669' : analysis.overallScore >= 60 ? '#d97706' : '#dc2626'};">
                ${analysis.overallScore}%
              </div>
              <div style="color: #64748b; font-size: 14px;">Overall Score</div>
            </div>
          </div>
        </div>
        
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #065f46; margin-top: 0;">Key Strengths</h3>
          <ul style="color: #065f46;">
            ${analysis.strengths.slice(0, 3).map(strength => `<li>${strength}</li>`).join('')}
          </ul>
        </div>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #92400e; margin-top: 0;">Areas for Improvement</h3>
          <ul style="color: #92400e;">
            ${analysis.improvements.slice(0, 3).map(improvement => `<li>${improvement}</li>`).join('')}
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard/student?tab=resume" 
             style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Full Analysis
          </a>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }
}

module.exports = new EmailService();
