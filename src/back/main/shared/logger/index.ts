import type { LoggerOptions } from 'pino'
import pino from 'pino'

import type { LogFn, Logger, LogLevel, MinimumLogger } from '../../types/shared/logger'
import { noopFn } from '../helper'

const createLogger: <Options extends LoggerOptions>(options?: Options) => Logger = (options?) => {
  const pinoOptions = {
    transport: {
      options: {
        ignore: 'pid,hostname,reqId,responseTime,req,res',
        translateTime: true,
      },
      target: 'pino-pretty',
    },
    ...options,
  }
  return pino(pinoOptions)
}

const hasLevelFn = (logger: unknown, level: LogLevel): boolean => {
  return (
    typeof logger === 'object' &&
    !!logger &&
    level in logger &&
    typeof (logger as Logger)[level] === 'function'
  )
}

const hasFatalLogLevel = (logger: unknown): logger is { fatal: LogFn } =>
  hasLevelFn(logger, 'fatal')
const hasDebugLogLevel = (logger: unknown): logger is { debug: LogFn } =>
  hasLevelFn(logger, 'debug')
const hasTraceLogLevel = (logger: unknown): logger is { trace: LogFn } =>
  hasLevelFn(logger, 'trace')
const hasSilentLogLevel = (logger: unknown): logger is { silent: LogFn } =>
  hasLevelFn(logger, 'silent')

const toLogger: <T extends MinimumLogger>(fromLogger: T) => Logger = (fromLogger) => {
  const log = {} as Logger
  log.info = fromLogger.info.bind(fromLogger)
  log.warn = fromLogger.warn.bind(fromLogger)
  log.error = fromLogger.error.bind(fromLogger)
  log.fatal = hasFatalLogLevel(fromLogger) ? fromLogger.fatal.bind(fromLogger) : log.error
  log.debug = hasDebugLogLevel(fromLogger) ? fromLogger.debug.bind(fromLogger) : log.info
  log.trace = hasTraceLogLevel(fromLogger) ? fromLogger.trace.bind(fromLogger) : log.info
  log.silent = hasSilentLogLevel(fromLogger) ? fromLogger.silent.bind(fromLogger) : noopFn
  return log
}

export { createLogger, toLogger }
