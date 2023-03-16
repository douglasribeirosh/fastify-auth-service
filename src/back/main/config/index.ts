import dotenv from 'dotenv'
import { join } from 'path'
import { Config } from '../types/config'
import { baseDir } from './base-dir'

const defaultConfig: Config = {
  host: '0.0.0.0',
  jwtSecret: 'OVERRIDE-ME',
  logLevel: 'info',
  port: '33666',
}

const defaultTestConfig: Config = {
  host: '0.0.0.0',
  jwtSecret: 'test-secret',
  logLevel: 'debug',
  port: '33667',
}

const buildConfigFromEnv = () => {
  dotenv.config({ path: join(baseDir, '.env') })
  const config: Config = {
    port: process.env[`PORT`] ?? defaultConfig.port,
    host: process.env[`HOST`] ?? defaultConfig.host,
    jwtSecret: process.env[`JWT_SECRET`] ?? defaultConfig.jwtSecret,
    logLevel: process.env[`LOG_LEVEL`] ?? defaultConfig.logLevel,
  }
  return config
}

export { buildConfigFromEnv, defaultTestConfig }
