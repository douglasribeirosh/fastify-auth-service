import { config } from 'dotenv'
import { join } from 'path'

// import { baseDir } from '../main/config/base-dir'
// import { deleteEnvVars } from './util/env-utils'

const jestGlobalSetup = () => {
  // deleteEnvVars('LOG_LEVEL', 'JWT_SECRET')
  config({ path: join('../../../', '.env.test') })
}

export default jestGlobalSetup
