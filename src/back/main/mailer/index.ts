import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { Config } from '../types/config'
import { Mail, Mailer } from '../types/mailer'

const buildMailer = async (config: Config): Promise<Mailer> => {
  const testAccount = config.smtpUseTestAccount ? await nodemailer.createTestAccount() : undefined
  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smptPort,
    secure: config.smptPort === 465, // true for 465, false for other ports
    auth: {
      user: testAccount ? testAccount.user : config.smtpUser, // generated ethereal user
      pass: testAccount ? testAccount.pass : config.smtpPass, // generated ethereal password
    },
  })
  const mailer: Mailer = {
    sendMail: async (mail: Mail) => {
      const mailOptions = {
        from: `"${config.mailerFromName}" <${config.mailerFromAddr}>`,
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
        html: `<b>${mail.text}</b>`,
      }
      console.log('**** Trying to send email:', { mailOptions })
      const info: SMTPTransport.SentMessageInfo = await transporter.sendMail(mailOptions)
      return info
    },
  }
  return mailer
}

export { buildMailer }
