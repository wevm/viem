import type { Address } from 'abitype'

import type { PublicClient, Transport } from '../../clients/index.js'
import type { ByteArray, Chain, Hex } from '../../types/index.js'
import { hashMessage, isHex, toHex } from '../../utils/index.js'
import {
  verifyMessage as offlineVerifyMessage,
  VerifyMessageParameters as OfflineVerifyMessageParameters,
  VerifyMessageReturnType as OfflineVerifyMessageReturnType,
} from '../../utils/signature/verifyMessage.js'
import { readContract } from './readContract.js'
import { smartAccountAbi } from '../../constants/abis.js'
import {
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  ContractFunctionZeroDataError,
} from '../../errors/index.js'
import { ERC1271_MAGICVALUE } from '../../constants/index.js'
import type { CallParameters } from './call.js'

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
 * @internal Please do not use this method outside of the SDK, it is not meant to be used directly, use verifyMessage and verifyTypedData instead
 * @param TChain - The chain type inferred from the client
 * @param client - The public client
 * @param parameters - Object containing the message hash, signature and address to verify, plus optional blockTag and blockNumber for the onchain call
 * @param parameters.address - The address to verify the message hash for
 * @param parameters.messageHash - The message hash to verify
 * @param parameters.signature - The signature to verify
 * @param parameters.blockTag - The block tag to use for the call
 * @param parameters.blockNumber - The block number to use for the call
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

/**
 * Verifies a message signature considering ERC1271 with fallback to EOA signature verification
 *
 * - Docs {@link https://viem.sh/docs/actions/public/verifyMessage.html}
 *
 * @param TChain - The chain type inferred from the client
 * @param client - The public client
 * @param parameters - Object containing the message, signature and address to verify, plus optional blockTag and blockNumber for the onchain call
 * @param parameters.address - The address to verify the message for
 * @param parameters.message - The message to verify
 * @param parameters.signature - The signature to verify
 * @param parameters.blockTag - The block tag to use for the call
 * @param parameters.blockNumber - The block number to use for the call
 * @returns true if the signature is valid, false if the signature is invalid
 */
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
