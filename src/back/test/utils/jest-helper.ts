import { join } from 'path'

const doMockFromBaseDir = function <T = unknown>(
  moduleNameFromBaseDir: string,
  factory?: () => T,
  options?: jest.MockOptions,
): typeof jest {
  const moduleName = join("../../../../", moduleNameFromBaseDir)
  return jest.doMock(moduleName, factory, options)
}

// eslint-disable-next-line @typescript-eslint/ban-types,@typescript-eslint/no-explicit-any
const requireFromBaseDir = function <TModule extends {} = any>(
  moduleNameFromBaseDir: string,
): TModule {
  const moduleName = join("../../../../", moduleNameFromBaseDir)
  return require(moduleName)
}

export { doMockFromBaseDir, requireFromBaseDir }
