import dotenv from 'dotenv'
import { join } from 'path'
import { Config } from '../types/config'
import { baseDir } from './base-dir'

const defaultConfig: Config = {
  port: '33666',
  host: '0.0.0.0',
  logLevel: 'info',
}

const defaultTestConfig: Config = {
  port: '33667',
  host: '0.0.0.0',
  logLevel: 'debug',
}

const buildConfigFromEnv = () => {
  dotenv.config({ path: join(baseDir, '.env') })
  const config: Config = {
    port: process.env[`PORT`] ?? defaultConfig.port,
    host: process.env[`HOST`] ?? defaultConfig.host,
    logLevel: process.env[`LOG_LEVEL`] ?? defaultConfig.logLevel,
  }
  return config
}

export { buildConfigFromEnv, defaultTestConfig }
