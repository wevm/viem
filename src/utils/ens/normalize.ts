import { ens_normalize } from '@adraffy/ens-normalize'
import type { ErrorType } from '../../errors/utils.js'

export type NormalizeErrorType = ErrorType

/**
 * @description Normalizes ENS name according to ENSIP-15.
 *
 * @example
 * normalize('wevm.eth')
 * 'wevm.eth'
 *
 * @see https://docs.ens.domains/contract-api-reference/name-processing#normalising-names
 * @see https://github.com/ensdomains/docs/blob/9edf9443de4333a0ea7ec658a870672d5d180d53/ens-improvement-proposals/ensip-15-normalization-standard.md
 */
export function normalize(name: string) {
  return ens_normalize(name)
}
