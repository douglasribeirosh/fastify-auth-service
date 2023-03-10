const { resolve } = require('path')
const jestBaseConfig = require('../jest.config')

const baseDir = resolve(__dirname, '../../../')

module.exports = {
  ...jestBaseConfig,
  coverageDirectory: resolve(baseDir, 'dist', 'coverage', 'unit'),
  testMatch: [resolve(__dirname, '**/*.test.ts')],
}
