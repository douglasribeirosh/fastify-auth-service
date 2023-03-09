import { logLevels } from '../shared/logger/log-levels'
import type { EnvVarSpecs } from '../types/config/env-var-specs'

const envVarDefaultValues = {
  ADMIN_INITIAL_PASSWORD: 'initialpassw0rd',
  HOST: '0.0.0.0',
  LOG_LEVEL: 'info',
  NAME: 'fastify-auth-api',
  PORT: 9666,
}

const envVarSpecs: EnvVarSpecs = {
  ADMIN_INITIAL_PASSWORD: {
    defaultValue: envVarDefaultValues.ADMIN_INITIAL_PASSWORD,
    description: 'Default admin user initial password',
    name: 'adminInitialPassword',
    type: 'string',
  },
  DATABASE_URL: {
    description: 'Postgresql database server URL',
    name: 'databaseUrl',
    type: 'string',
  },
  HOST: {
    defaultValue: envVarDefaultValues.HOST,
    description: 'Optional hostname to bind when starting the web server',
    name: 'host',
    type: 'string',
  },
  JWT_SECRET: {
    description: 'If set, enable JWT with specified secret and expose authentication endpoint',
    name: 'jwtSecret',
    type: 'string',
  },
  LOG_LEVEL: {
    defaultValue: envVarDefaultValues.LOG_LEVEL,
    description: 'Level of the logging system',
    name: 'logLevel',
    type: ['enum', ...logLevels],
  },
  PORT: {
    defaultValue: envVarDefaultValues.PORT,
    description:
      'Optional port to bind when starting the web server, if 0 then any free port is binded',
    name: 'port',
    type: 'number',
  },
}

const showEnvVarSpecs = (isMainModule = require.main === module) => {
  if (!isMainModule) {
    return
  }
  console.log('Supported environment variables:')
  console.log('')
  Object.entries(envVarSpecs).forEach(([name, envVarSpec]) => {
    const { defaultValue, description, type } = envVarSpec
    const defaultValueDesc = defaultValue !== undefined ? ` [default: ${defaultValue}]` : ''
    console.log(`- ${name} (${type}): ${description}${defaultValueDesc}`)
  })
  console.log('')
}

export { envVarDefaultValues, showEnvVarSpecs }
export default envVarSpecs

showEnvVarSpecs()
