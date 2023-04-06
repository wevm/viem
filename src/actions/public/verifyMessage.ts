import type { Address } from 'abitype'

import type { PublicClient, Transport } from '../../clients'
import type { ByteArray, Chain, Hex } from '../../types'
import { hashMessage, isHex, toHex } from '../../utils'
import {
  verifyMessage as offlineVerifyMessage,
  VerifyMessageParameters as OfflineVerifyMessageParameters,
  VerifyMessageReturnType as OfflineVerifyMessageReturnType,
} from '../../utils/signature/verifyMessage'
import { readContract } from './readContract'
import { smartAccountAbi } from '../../constants/abis'
import {
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  ContractFunctionZeroDataError,
} from '../../errors'
import { ERC1271_MAGICVALUE } from '../../constants'
import type { CallParameters } from './call'

export type VerifyMessageHashOnchainParameters = Pick<
  CallParameters,
  'blockNumber' | 'blockTag'
> & {
  address: Address
  messageHash: Hex
  signature: Hex | ByteArray
}

export type VerifyMessageHashOnchainReturnType = boolean | null

/**
 * Verifies a message hash on chain using ERC1271
 *
 * @private Please do not use this method outside of the SDK, it is not meant to be used directly, use verifyMessage and verifyTypedData instead
 * @param client - The public client
 * @param parameters
 * @returns true if the signature is valid, false if the signature is invalid, null if the contract does not support ERC1271
 */
export async function verifyMessageHashOnChain<
  TChain extends Chain | undefined,
>(
  client: PublicClient<Transport, TChain>,
  {
    address,
    messageHash,
    signature,
    ...callRequest
  }: VerifyMessageHashOnchainParameters,
): Promise<VerifyMessageHashOnchainReturnType> {
  try {
    const signatureHex = isHex(signature) ? signature : toHex(signature)
    const data = await readContract(client, {
      abi: smartAccountAbi,
      address,
      args: [messageHash, signatureHex],
      functionName: 'isValidSignature',
      ...callRequest,
    })
    return data === ERC1271_MAGICVALUE
  } catch (err) {
    if (
      err instanceof ContractFunctionExecutionError &&
      err.cause instanceof ContractFunctionRevertedError &&
      // Ignore reverts which have no custom error message, this way we can differentiate between a contract that supports ERC1271 and one that does not
      err.cause.reason !== 'execution reverted'
    ) {
      return false
    }
    if (
      err instanceof ContractFunctionExecutionError &&
      (err.cause instanceof ContractFunctionZeroDataError ||
        err.cause instanceof ContractFunctionRevertedError)
    ) {
      return null // Contract does not support ERC1271
    }
    throw err // Network errors and other errors should be thrown
  }
}

export type VerifyMessageParameters = Omit<
  VerifyMessageHashOnchainParameters,
  'messageHash'
> &
  OfflineVerifyMessageParameters

export type VerifyMessageReturnType = OfflineVerifyMessageReturnType

export async function verifyMessage<TChain extends Chain | undefined,>(
  client: PublicClient<Transport, TChain>,
  { address, message, signature, ...callRequest }: VerifyMessageParameters,
): Promise<VerifyMessageReturnType> {
  const messageHash = hashMessage(message)
  const onChainResult = await verifyMessageHashOnChain(client, {
    address,
    messageHash,
    signature,
    ...callRequest,
  })

  // If the contract does not support ERC1271, we fallback to the offline verification
  if (onChainResult !== null) {
    return onChainResult
  }

  return offlineVerifyMessage({ address, message, signature })
}
