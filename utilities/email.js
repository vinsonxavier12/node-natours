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
    if (process.env.NODE_ENV === "production") {
      // For email jonas used SendGrid
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

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
      text: htmlToText.convert(html),
    };

    // 3) Create a transporter and send the email
    await this.createTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the natours phemily!");
  }

  async sendResetPassword() {
    await this.send(
      "resetPassword",
      "Reset your password(Valid for only 10 minutes",
    );
  }
};
