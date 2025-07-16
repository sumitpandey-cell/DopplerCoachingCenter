// Email notification service for enrollment confirmations and withdrawals

interface EnrollmentEmailData {
  studentName: string;
  studentEmail: string;
  subjectName: string;
  subjectCode: string;
  enrollmentDate: Date;
  credits: number;
  schedule: string;
  faculty: string;
}

interface WithdrawalEmailData {
  studentName: string;
  studentEmail: string;
  subjectName: string;
  subjectCode: string;
  withdrawalDate: Date;
  reason?: string;
}

export const sendEnrollmentConfirmation = async (data: EnrollmentEmailData): Promise<void> => {
  try {
    console.log('Sending enrollment confirmation email:', {
      to: data.studentEmail,
      subject: `Enrollment Confirmation - ${data.subjectName}`,
      content: `
        Dear ${data.studentName},
        
        You have successfully enrolled in the following subject:
        
        Subject: ${data.subjectName} (${data.subjectCode})
        Credits: ${data.credits}
        Faculty: ${data.faculty}
        Schedule: ${data.schedule}
        Enrollment Date: ${data.enrollmentDate.toLocaleDateString()}
        
        Important Information:
        - Please attend all scheduled classes
        - Check the student portal for updates and materials
        - Contact your faculty for any subject-related queries
        
        Best regards,
        Doppler Coaching Center
      `
    });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Log successful email delivery
    await logEmailDelivery({
      recipientEmail: data.studentEmail,
      subject: `Enrollment Confirmation - ${data.subjectName}`,
      status: 'sent',
      timestamp: new Date(),
      type: 'enrollment_confirmation'
    });
    
  } catch (error) {
    console.error('Failed to send enrollment confirmation email:', error);
    
    // Log failed email delivery
    await logEmailDelivery({
      recipientEmail: data.studentEmail,
      subject: `Enrollment Confirmation - ${data.subjectName}`,
      status: 'failed',
      timestamp: new Date(),
      type: 'enrollment_confirmation'
    });
    
    throw new Error('Failed to send enrollment confirmation email');
  }
};

export const sendWithdrawalConfirmation = async (data: WithdrawalEmailData): Promise<void> => {
  try {
    console.log('Sending withdrawal confirmation email:', {
      to: data.studentEmail,
      subject: `Subject Withdrawal Confirmation - ${data.subjectName}`,
      content: `
        Dear ${data.studentName},
        
        You have successfully withdrawn from the following subject:
        
        Subject: ${data.subjectName} (${data.subjectCode})
        Withdrawal Date: ${data.withdrawalDate.toLocaleDateString()}
        ${data.reason ? `Reason: ${data.reason}` : ''}
        
        Important Information:
        - Your withdrawal has been processed
        - This may affect your credit load and academic progress
        - Contact the academic office if you have any questions
        - You may re-enroll if the add/drop period is still active
        
        Best regards,
        Doppler Coaching Center
      `
    });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Log successful email delivery
    await logEmailDelivery({
      recipientEmail: data.studentEmail,
      subject: `Subject Withdrawal Confirmation - ${data.subjectName}`,
      status: 'sent',
      timestamp: new Date(),
      type: 'withdrawal_confirmation'
    });
    
  } catch (error) {
    console.error('Failed to send withdrawal confirmation email:', error);
    
    // Log failed email delivery
    await logEmailDelivery({
      recipientEmail: data.studentEmail,
      subject: `Subject Withdrawal Confirmation - ${data.subjectName}`,
      status: 'failed',
      timestamp: new Date(),
      type: 'withdrawal_confirmation'
    });
    
    throw new Error('Failed to send withdrawal confirmation email');
  }
};

// Log email delivery for admin records
const logEmailDelivery = async (emailData: {
  recipientEmail: string;
  subject: string;
  status: 'sent' | 'failed';
  timestamp: Date;
  type: string;
}) => {
  // In production, store email logs in Firestore
  console.log('Email delivery log:', emailData);
};

export const sendBulkEnrollmentNotifications = async (enrollments: EnrollmentEmailData[]): Promise<void> => {
  const results = await Promise.allSettled(
    enrollments.map(enrollment => sendEnrollmentConfirmation(enrollment))
  );
  
  const failed = results.filter(result => result.status === 'rejected');
  if (failed.length > 0) {
    console.warn(`${failed.length} enrollment confirmation emails failed to send`);
  }
};