const nodeMailer = require("nodemailer");

const sendEmail = async(options) => {
      const transpoter = nodeMailer.createTransport({
        host:"smtp.gmail.com",
        service:"gmail",
        auth:{
            user:"phritik06@gmail.com",
            pass:"Hritik@12345"
        }
      })

      const mailOptions = {
        from:"phritik06@gmail.com",
        to:options.email,
        subject:options.subject,
        text:options.message
      }

     await transpoter.sendMail(mailOptions)
}

module.exports = sendEmail