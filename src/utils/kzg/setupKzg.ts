import type { ErrorType } from '../../errors/utils.js'
import {
  type DefineKzgErrorType,
  type DefineKzgParameters,
  type DefineKzgReturnType,
  defineKzg,
} from './defineKzg.js'

export type SetupKzgOptions = DefineKzgParameters & {
  loadTrustedSetup(path: string): void
}
export type SetupKzgReturnType = DefineKzgReturnType
export type SetupKzgErrorType = DefineKzgErrorType | ErrorType

export function setupKzg(
  path: string,
  options: SetupKzgOptions,
): SetupKzgReturnType {
  try {
    options.loadTrustedSetup(path)
  } catch (e) {
    const error = e as Error
    if (!error.message.includes('trusted setup is already loaded')) throw error
  }
  return defineKzg(options)
}
