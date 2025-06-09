const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'vutrongtien215@gmail.com',
    pass: 'awho dybr frnr pwze',
  },
  tls: {
    rejectUnauthorized: false, // Thêm dòng này để bỏ qua lỗi self-signed certificate
  },
});

module.exports = async function sendMail(to, subject, text) {
  await transporter.sendMail({
    from: 'vutrongtien215@gmail.com',
    to,
    subject,
    text,
  });
};