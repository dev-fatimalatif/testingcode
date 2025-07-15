import { host } from 'envalid';
import nodemailer from 'nodemailer';



export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
  try {
    // Create a transporter using SMTP details from config.
    const transporter = nodemailer.createTransport({
        secure: false, // true for 465, false for other ports
host: 'smtp.gmail.com',
port: 587,

      auth: {
        user: 'm.ahmadkhan.ucp@gmail.com',
        pass: 'zesbwaosczztohii',
      },
    });

    // Define the email options.
    const mailOptions = {
      from: '"The Autobid" <no-reply@yourapp.com>', // e.g., '"Your App" <no-reply@yourapp.com>'
      to,
      subject,
      text,
    };

    // Send the email.
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} successfully.`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
