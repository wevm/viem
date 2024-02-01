import type { ErrorType } from '../../errors/utils.js'
import type { Kzg } from '../../types/kzg.js'

export type DefineKzgParameters = Kzg
export type DefineKzgReturnType = Kzg
export type DefineKzgErrorType = ErrorType

export function defineKzg({
  blobToKzgCommitment,
  computeBlobKzgProof,
}: DefineKzgParameters): DefineKzgReturnType {
  return {
    blobToKzgCommitment,
    computeBlobKzgProof,
  }
}
