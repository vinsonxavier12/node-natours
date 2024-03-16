const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name.split(" ")[0] || user.name;
    this.url = url;
    this.from = "Vinson Xavier <vinsonxavier12@gmail.com>";
  }

  createTransport() {
    if (process.env.NODE_ENV === "production") return null;

    return nodemailer.createTransport({
      port: process.env.EMAIL_PORT,
      host: process.env.EMAIL_HOST,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // 1) Render HTML based on the pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstname,
        url: this.url,
        subject,
      },
    );

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    // 3) Create a transporter and send the email
    await this.createTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the natours phemily!");
  }
};

// const sendEmail = async (options) => {
//   // 1) Creating email transporter
//   const transporter = nodemailer.createTransport({
//     port: process.env.EMAIL_PORT,
//     host: process.env.EMAIL_HOST,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   // 2) Defining email options
//   const mailOptions = {
//     from: "Vinson Xavier <vinsonxavier12@gmail.com>",
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   // 3) Sending the email
//   await transporter.sendMail(mailOptions);
// };
