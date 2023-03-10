const { join, resolve } = require('path')
const { name } = require('../../../package.json')

const baseDir = resolve(__dirname, '../../../')

const ci = process.env.CI === 'true'

const coverageReporters = ci ? ['text', 'lcov', 'cobertura'] : ['lcov', 'text', 'html']

const reporters = ci
  ? [
      'default',
      [
        'jest-junit',
        {
          outputDirectory: join(baseDir, 'dist', 'test'),
        },
      ],
    ]
  : ['default']

module.exports = {
  ci,
  clearMocks: true,
  collectCoverageFrom: ['src/back/main/**/!(*.d)*.ts'],
  coverageDirectory: join(baseDir, 'dist', 'coverage', 'all'),
  coverageReporters,
  displayName: name,
  globalSetup: join(__dirname, 'jest-global-setup.ts'),
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/tmp/'],
  reporters,
  rootDir: baseDir,
  setupFilesAfterEnv: [join(__dirname, 'jest-custom.ts')],
  silent: true,
  testEnvironment: 'node',
  testMatch: ['**/*.test.[jt]s'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  verbose: false,
}
