// Email service using EmailJS (you can also use SendGrid or Firebase Functions)

interface StudentIdEmailData {
  studentName: string;
  studentEmail: string;
  studentId: string;
  password: string;
}

export const sendStudentIdEmail = async (data: StudentIdEmailData): Promise<void> => {
  try {
    // For demo purposes, we'll simulate email sending
    // In production, integrate with EmailJS, SendGrid, or Firebase Functions
    
    console.log('Sending Student ID email:', {
      to: data.studentEmail,
      subject: 'Your Doppler Coaching Student ID',
      content: `
        Dear ${data.studentName},
        
        Welcome to Doppler Coaching Center!
        
        Your Student ID has been generated successfully:
        
        Student ID: ${data.studentId}
        Password: ${data.password}
        
        You can now login to your student portal at:
        ${typeof window !== 'undefined' ? window.location.origin : 'https://dopplercoaching.com'}/login/student-id
        
        Please keep your Student ID and password secure.
        
        Best regards,
        Doppler Coaching Team
      `
    });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Log successful email delivery
    await logEmailDelivery({
      recipientEmail: data.studentEmail,
      subject: 'Your Doppler Coaching Student ID',
      status: 'sent',
      timestamp: new Date(),
      studentId: data.studentId
    });
    
  } catch (error) {
    console.error('Failed to send email:', error);
    
    // Log failed email delivery
    await logEmailDelivery({
      recipientEmail: data.studentEmail,
      subject: 'Your Doppler Coaching Student ID',
      status: 'failed',
      timestamp: new Date(),
      studentId: data.studentId
    });
    
    throw new Error('Failed to send email notification');
  }
  
  // In production, implement actual email sending:
  /*
  // Using EmailJS
  await emailjs.send(
    'your_service_id',
    'your_template_id',
    {
      to_email: data.studentEmail,
      to_name: data.studentName,
      student_id: data.studentId,
      password: data.password,
      login_url: `${window.location.origin}/login/student-id`
    },
    'your_public_key'
  );
  
  // Or using SendGrid
  const msg = {
    to: data.studentEmail,
    from: 'noreply@dopplercoaching.com',
    subject: 'Your Doppler Coaching Student ID',
    html: `
      <h2>Welcome to Doppler Coaching Center!</h2>
      <p>Dear ${data.studentName},</p>
      <p>Your Student ID has been generated successfully:</p>
      <div style="background: #f5f5f5; padding: 15px; margin: 15px 0;">
        <strong>Student ID:</strong> ${data.studentId}<br>
        <strong>Password:</strong> ${data.password}
      </div>
      <p>You can login at: <a href="${window.location.origin}/login/student-id">Student Portal</a></p>
      <p>Best regards,<br>Doppler Coaching Team</p>
    `
  };
  await sgMail.send(msg);
  */
};

// Log email delivery for admin records
export const logEmailDelivery = async (emailData: {
  recipientEmail: string;
  subject: string;
  status: 'sent' | 'failed';
  timestamp: Date;
  studentId?: string;
  facultyId?: string;
}) => {
  // In production, store email logs in Firestore
  console.log('Email delivery log:', emailData);
};

interface FacultyIdEmailData {
  facultyName: string;
  facultyEmail: string;
  facultyId: string;
  password: string;
}

export const sendFacultyIdEmail = async (data: FacultyIdEmailData): Promise<void> => {
  try {
    // For demo purposes, we'll simulate email sending
    console.log('Sending Faculty ID email:', {
      to: data.facultyEmail,
      subject: 'Your Doppler Coaching Faculty ID',
      content: `
        Dear ${data.facultyName},
        
        Welcome to Doppler Coaching Center!
        
        Your Faculty ID has been generated successfully:
        
        Faculty ID: ${data.facultyId}
        Temporary Password: ${data.password}
        
        You can now sign up for your faculty portal at:
        ${typeof window !== 'undefined' ? window.location.origin : 'https://dopplercoaching.com'}/signup/faculty
        
        After signing up, you can login at:
        ${typeof window !== 'undefined' ? window.location.origin : 'https://dopplercoaching.com'}/login/faculty
        
        Please keep your Faculty ID secure and change your password after first login.
        
        Best regards,
        Doppler Coaching Team
      `
    });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Log successful email delivery
    await logEmailDelivery({
      recipientEmail: data.facultyEmail,
      subject: 'Your Doppler Coaching Faculty ID',
      status: 'sent',
      timestamp: new Date(),
      facultyId: data.facultyId
    });
    
  } catch (error) {
    console.error('Failed to send faculty email:', error);
    
    // Log failed email delivery
    await logEmailDelivery({
      recipientEmail: data.facultyEmail,
      subject: 'Your Doppler Coaching Faculty ID',
      status: 'failed',
      timestamp: new Date(),
      facultyId: data.facultyId
    });
    
    throw new Error('Failed to send email notification');
  }
};