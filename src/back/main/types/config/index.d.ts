export type Config = {
  host: string
  jwtSecret: string
  logLevel: string
  port: number
  redisUrl: string
  redisExpireSeconds: number
  smtpHost: string
  smptPort: number
  smtpUseTestAccount: boolean
  smtpUser: string
  smtpPass: string
  mailerFromName: string
  mailerFromAddr: string
  devInitialData: boolean
}
