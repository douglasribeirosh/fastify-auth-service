import dotenv from 'dotenv'
import { join } from 'path'
import { Config } from '../types/config'
import { baseDir } from './base-dir'

const defaultConfig: Config = {
  host: '0.0.0.0',
  jwtSecret: 'OVERRIDE-ME',
  logLevel: 'info',
  port: 33666,
  redisUrl: 'redis://localhost:6379/0',
  redisExpireSeconds: 60 * 30,
  smtpHost: 'smtp.ethereal.email',
  smptPort: 587,
  smtpUseTestAccount: true,
  smtpUser: 'stmpUser',
  smtpPass: 'smtpPass',
  mailerFromName: 'Test User',
  mailerFromAddr: 'testuser@example.com',
  devInitialData: false,
}

const defaultTestConfig: Config = {
  host: '0.0.0.0',
  jwtSecret: 'test-secret',
  logLevel: 'info',
  port: 33667,
  redisUrl: 'redis://localhost:6379/1',
  redisExpireSeconds: 60,
  smtpHost: 'smtp.ethereal.email',
  smptPort: 587,
  smtpUseTestAccount: true,
  smtpUser: 'stmpUser',
  smtpPass: 'smtpPass',
  mailerFromName: 'Test User',
  mailerFromAddr: 'testuser@example.com',
  devInitialData: false,
}

const buildConfigFromEnv = () => {
  dotenv.config({ path: join(baseDir, '.env') })
  const config: Config = {
    port: process.env[`PORT`] ? +process.env[`PORT`] : defaultConfig.port,
    host: process.env[`HOST`] ?? defaultConfig.host,
    jwtSecret: process.env[`JWT_SECRET`] ?? defaultConfig.jwtSecret,
    logLevel: process.env[`LOG_LEVEL`] ?? defaultConfig.logLevel,
    redisUrl: process.env[`REDIS_URL`] ?? defaultConfig.redisUrl,
    redisExpireSeconds: process.env[`REDIS_EXPIRE_SECONDS`]
      ? +process.env[`REDIS_EXPIRE_SECONDS`]
      : defaultConfig.redisExpireSeconds,
    smtpHost: process.env[`SMTP_HOST`] ?? defaultConfig.smtpHost,
    smptPort: process.env[`SMTP_PORT`] ? +process.env[`SMTP_PORT`] : defaultConfig.smptPort,
    smtpUseTestAccount: process.env[`SMTP_USE_TEST_ACCOUNT`]
      ? process.env[`SMTP_USE_TEST_ACCOUNT`] === 'true'
      : defaultConfig.smtpUseTestAccount,
    smtpUser: process.env[`SMTP_USER`] ?? defaultConfig.smtpUser,
    smtpPass: process.env[`SMTP_PASS`] ?? defaultConfig.smtpPass,
    mailerFromName: process.env[`MAILER_FROM_NAME`] ?? defaultConfig.mailerFromName,
    mailerFromAddr: process.env[`MAILER_FROM_ADDR`] ?? defaultConfig.mailerFromAddr,
    devInitialData: process.env[`DEV_INITIAL_DATA`]
      ? process.env[`DEV_INITIAL_DATA`] === 'true'
      : defaultConfig.smtpUseTestAccount,
  }
  return config
}

export { buildConfigFromEnv, defaultTestConfig }
