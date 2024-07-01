const { emailVerfication, passwordVerfication } = require('@/emailTemplate/emailVerfication');
const nodemailer = require('nodemailer');

const sendMail = async ({
  email,
  name,
  link,
  idurar_app_email,
  subject = 'Verify your email | idurar',
  type = 'emailVerfication',
  emailToken,
}) => {
  
  // Configure Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // e.g., 'smtp.gmail.com'
    port: process.env.SMTP_PORT, // e.g., 587
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // your email address
      pass: process.env.SMTP_PASS, // your email password or app-specific password
    },
    tls: {
      // Allow self-signed certificates
      rejectUnauthorized: false,
    },
  });

  try {
    const mailOptions = {
      from: idurar_app_email,
      to: email,
      subject,
      html:
        type === 'emailVerfication'
          ? emailVerfication({ name, link, emailToken })
          : passwordVerfication({ name, link }),
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Re-throw the error after logging it
  }
};

// const { Resend } = require('resend');

// const sendMail = async ({
//   email,
//   name,
//   link,
//   idurar_app_email,
//   subject = 'Verify your email | idurar',
//   type = 'emailVerfication',
//   emailToken,
// }) => {
  
//   const resendy = new Resend(process.env.RESEND_API);

//   try {
//     const edata = await resendy.emails.send({
//       from: idurar_app_email,
//       to: email,
//       subject,
//       html:
//         type === 'emailVerfication'
//           ? emailVerfication({ name, link, emailToken })
//           : passwordVerfication({ name, link }),
//     });

//     return edata;
//   } catch (error) {
//     console.error('Error sending email:', error);
//     throw error; // Re-throw the error after logging it
//   }
// };

module.exports = sendMail;
