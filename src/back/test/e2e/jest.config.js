const { resolve } = require('path')
const jestBaseConfig = require('../jest.config')

const baseDir = resolve(__dirname, '../../../')

module.exports = {
  ...jestBaseConfig,
  coverageDirectory: resolve(baseDir, 'dist', 'coverage', 'e2e'),
  testMatch: [resolve(__dirname, '**/*.test.ts')],
}
