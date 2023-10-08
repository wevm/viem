import type { ErrorType } from '../../errors/utils.js'
import type { Proof } from '../../types/proof.js'
import type { RpcProof } from '../../types/rpc.js'
import { hexToNumber } from '../index.js'

export type FormatProofErrorType = ErrorType

function formatStorageProof(storageProof: RpcProof['storageProof']) {
  return storageProof.map((proof) => ({
    ...proof,
    value: BigInt(proof.value),
  }))
}

export function formatProof(proof: Partial<RpcProof>) {
  return {
    ...proof,
    balance: proof.balance ? BigInt(proof.balance) : undefined,
    nonce: proof.nonce ? hexToNumber(proof.nonce) : undefined,
    storageProof: proof.storageProof
      ? formatStorageProof(proof.storageProof)
      : undefined,
  } as Proof
}
