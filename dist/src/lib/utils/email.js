"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const html_to_text_1 = require("html-to-text");
const welcomeTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to our shop!</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f8f8f8;
        font-family: Arial, sans-serif;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 60px auto;
        background-color: #fff;
        border-radius: 10px;
        text-align: center;
        border: 4px solid #fff;
        box-shadow: 0 0 50px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #FFD700;
        padding: 20px;
        border-radius: 10px 10px 0 0;
      }
      .header h1 {
        margin: 0;
        color: #fff;
      }
      .content {
        padding: 20px;
      }
      .content h2 {
        color: #333;
        margin-bottom: 10px;
      }
      .content p {
        color: #666;
        line-height: 1.6;
      }
      .footer {
        padding: 10px;
        background-color: #FFD700;
        border-radius: 0 0 10px 10px;
        color: #fff;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Welcome to our e-commerce shop!</h1>
      </div>
      <div class="content">
        <h2>Hello, {{username}}!</h2>
        <p>Thank you for joining our platform. We are excited to have you with us.</p>
        <p>Feel free to explore our services and let us know if you have any questions.</p>
      </div>
      <div class="footer">
        <p>Credits: Developed by E-Commerce Shop</p>
      </div>
    </div>
  </body>
</html>
`;
const resetPassTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f8f8f8;
        font-family: Arial, sans-serif;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 60px auto;
        background-color: #fff;
        border-radius: 10px;
        text-align: center;
        border: 4px solid #fff;
        box-shadow: 0 0 50px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #FFD700;
        padding: 20px;
        border-radius: 10px 10px 0 0;
      }
      .header h1 {
        margin: 0;
        color: #fff;
      }
      .content {
        padding: 20px;
      }
      .content h2 {
        color: #333;
        margin-bottom: 10px;
      }
      .content p {
        color: #666;
        line-height: 1.6;
      }
      .content a {
        display: inline-block;
        margin-top: 20px;
        padding: 10px 20px;
        background-color: #FFD700;
        color: #fff;
        text-decoration: none;
        border-radius: 5px;
      }
      .footer {
        padding: 10px;
        background-color: #FFD700;
        border-radius: 0 0 10px 10px;
        color: #fff;
        font-size: 14px;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="header">
        <h1>Password Reset Request</h1>
      </div>
      <div class="content">
        <h2>Hello, {{username}}!</h2>
        <p>We received a request to reset your password. If you made this request, please click the button below to reset your password.</p>
        <a href="{{url}}">Reset Your Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
      </div>
      <div class="footer">
        <p>Credits: Developed by E-Commerce Shop!</p>
      </div>
    </div>
  </body>
</html>

`;
class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.firstName;
        this.url = url;
        this.from = `E-Commerce Shop <${process.env.COMPANY_EMAIL}>`;
    }
    newTransporter() {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.NODE_ENV === 'production') {
                return nodemailer_1.default.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.PRODUCTION_USERNAME,
                        pass: process.env.PRODUCTION_PASSWORD,
                    },
                });
            }
            else {
                return nodemailer_1.default.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: Number(process.env.EMAIL_PORT),
                    secure: false,
                    auth: {
                        user: process.env.EMAIL_USERNAME,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                });
            }
        });
    }
    send(template, subject) {
        return __awaiter(this, void 0, void 0, function* () {
            const transporter = yield this.newTransporter();
            let html;
            // Create the html template
            // const __filename = fileURLToPath(import.meta.url);
            // const __dirname = path.dirname(path.dirname(__filename));
            // const pathName = path.join(__dirname, 'lib', 'templates', `${template}.pug`);
            if (template === 'reset') {
                html = resetPassTemplate.replace('{{username}}', this.firstName);
                html = resetPassTemplate.replace('{{url}}', this.url);
            }
            else {
                html = welcomeTemplate.replace('{{username}}', this.firstName);
            }
            // Mail options for the email to be sent
            const mailOptions = {
                from: this.from,
                to: this.to,
                subject,
                html,
                text: (0, html_to_text_1.convert)(html),
            };
            return transporter === null || transporter === void 0 ? void 0 : transporter.sendMail(mailOptions);
        });
    }
    sendWelcome() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send('welcome', 'Welcome to our e-commerce shop!');
        });
    }
    sendResetPassword() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send('reset', 'Password reset link');
        });
    }
}
exports.default = Email;
// this.to = user.email;
// this.firstName = user.name.split(' ')[0];
// this.url = url;
// this.from = `Jonas Schmedtmann <${process.env.EMAIL_FROM}>`;
