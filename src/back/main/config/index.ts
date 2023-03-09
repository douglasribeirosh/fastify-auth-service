import dotenv from 'dotenv'
import { join } from 'path'

import { readJsonFileSync, sortObjectProperties } from '../shared/helper'
import type { Config, ConfigEnv } from '../types/config'
import type { EnvVarSpec, EnvVarSpecs, EnvVarTypeEnum } from '../types/config/env-var-specs'
import { baseDir } from './base-dir'
import envVarSpecs from './env-var-specs'

dotenv.config({ path: join(baseDir, '.env') })
dotenv.config({ path: join(baseDir, '.env.local') })

const defaultConfig = Object.values(envVarSpecs).reduce(
  (acc, envVarSpec) => {
    if (envVarSpec.defaultValue === undefined) {
      return acc
    }
    return { ...acc, [envVarSpec.name]: envVarSpec.defaultValue }
  },
  {
    baseDir,
  } as Config,
)

const buildBooleanConfigItem = (
  configEnv: ConfigEnv,
  envVarSpec: EnvVarSpec,
  envVarValue: string | undefined,
) => {
  if (envVarValue === undefined) {
    return
  }
  if (!['true', 'false'].includes(envVarValue)) {
    console.warn(
      `Config property '${String(
        envVarSpec.name,
      )}' does not support value '${envVarValue}' (supported values: true,false): ignore`,
    )
    return
  }
  Object.assign(configEnv, { [envVarSpec.name]: envVarValue === 'true' })
}

const buildEnumConfigItem = (
  configEnv: ConfigEnv,
  envVarSpec: EnvVarSpec,
  envVarValue: string | undefined,
) => {
  const [, ...enumValues] = envVarSpec.type as EnvVarTypeEnum
  if (!envVarValue) {
    return
  }
  if (!enumValues.includes(envVarValue)) {
    console.warn(
      `Config property '${String(
        envVarSpec.name,
      )}' does not support value '${envVarValue}' (supported values: ${enumValues.join(
        ',',
      )}): ignore`,
    )
    return
  }
  Object.assign(configEnv, { [envVarSpec.name]: envVarValue })
}

const buildNumberConfigItem = (
  configEnv: ConfigEnv,
  envVarSpec: EnvVarSpec,
  envVarValue: string | undefined,
) => {
  const valueNumber = Number(envVarValue)
  if (isNaN(valueNumber)) {
    return
  }
  Object.assign(configEnv, { [envVarSpec.name]: valueNumber })
}

const buildStringConfigItem = (
  configEnv: ConfigEnv,
  envVarSpec: EnvVarSpec,
  envVarValue: string | undefined,
) => {
  if (!envVarValue) {
    return
  }
  Object.assign(configEnv, { [envVarSpec.name]: envVarValue })
}

const buildConfigEnv: (specs: EnvVarSpecs) => ConfigEnv = (specs) => {
  const configEnv: ConfigEnv = {}
  Object.entries(specs).forEach(([envVarName, envVarSpec]) => {
    const envVarValue = process.env[envVarName]
    const type = Array.isArray(envVarSpec.type) ? envVarSpec.type[0] : envVarSpec.type
    switch (type) {
      case 'boolean':
        buildBooleanConfigItem(configEnv, envVarSpec, envVarValue)
        break
      case 'enum':
        buildEnumConfigItem(configEnv, envVarSpec, envVarValue)
        break
      case 'number':
        buildNumberConfigItem(configEnv, envVarSpec, envVarValue)
        break
      case 'string':
      default: {
        buildStringConfigItem(configEnv, envVarSpec, envVarValue)
      }
    }
  })
  return configEnv
}

const pkg = readJsonFileSync<{ name: string }>(baseDir, 'package.json')

const config: Config = sortObjectProperties({
  ...defaultConfig,
  ...buildConfigEnv(envVarSpecs),
  name: pkg.name,
})

export default config
export { defaultConfig }
