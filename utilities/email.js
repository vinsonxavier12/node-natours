const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) Creating email transporter
  const transporter = nodemailer.createTransport({
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Defining email options
  const mailOptions = {
    from: "Vinson Xavier <vinsonxavier12@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Sending the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
