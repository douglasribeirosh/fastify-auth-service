import SMTPTransport from 'nodemailer/lib/smtp-transport'

export type Mail = {
  to: string
  subject: string
  text: string
}

export type Mailer = {
  sendMail: (mail: Mail) => Promise<SMTPTransport.SentMessageInfo>
}
