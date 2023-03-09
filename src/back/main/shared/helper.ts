import findRoot from 'find-root'
import { readFileSync } from 'fs'
import { readFile } from 'fs/promises'
import { join } from 'path'

import type { AsyncRepeatUntil } from '../types/shared/helper'
import type { Logger } from '../types/shared/logger'

export const asyncRepeatUntil: AsyncRepeatUntil = <T>(
  fn: (index: number) => Promise<T>,
  loopCondition: (result: T, index: number) => boolean,
) => {
  let index = 0
  const nextIteration: () => Promise<T> = async () => {
    const result = await fn(index)
    if (loopCondition(result, index)) {
      index++
      return nextIteration()
    }
    return result
  }
  return nextIteration()
}

export const findNearestBaseDir = (from = __dirname) => {
  try {
    return findRoot(from)
  } catch {
    return undefined
  }
}

export const hasProperty = <T extends Record<string, unknown>>(o: unknown, name: string): o is T =>
  typeof o === 'object' && !!o && name in o

export const hasPropertyOfType = <T extends Record<string, unknown>>(
  o: unknown,
  name: string,
  valueType: string,
): o is T => hasProperty(o, name) && typeof o[name] === valueType

export const ignoreRejection = async <T>(p: Promise<T>, log?: Logger): Promise<T | undefined> => {
  let result: T | undefined
  try {
    result = await p
  } catch (err) {
    result = undefined
    log?.debug(String(err))
  }
  return result
}

export const noopFn = () => {
  // This function is empty, this comment is here to satisfy eslint constraints
}

export const readJsonFile = async <T>(...paths: string[]): Promise<T> => {
  const rawContent = await readFile(join(...paths), 'utf8')
  return JSON.parse(rawContent) as T
}

export const readJsonFileSync = <T>(baseDir: string, path: string): T => {
  const rawContent = readFileSync(join(baseDir, path), 'utf8')
  return JSON.parse(rawContent) as T
}

export const sortObjectProperties = <T extends Record<string, unknown>>(o: T): T =>
  Object.keys(o)
    .sort()
    .reduce((acc, key) => ({ ...acc, [key]: o[key] }), {} as T)

export const stringify = (o: unknown): string => {
  if (typeof o === 'object' && !!o) {
    return Object.entries(o)
      .map(([key, value]) => `${key}=${value}`)
      .join(', ')
  }
  return `${o}`
}
