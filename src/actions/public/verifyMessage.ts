import type { Address } from 'abitype'

import type { PublicClient, Transport } from '../../clients/index.js'
import type { ByteArray, Chain, Hex } from '../../types/index.js'
import {
  encodeDeployData,
  hashMessage,
  isHex,
  toHex,
} from '../../utils/index.js'
import {
  type VerifyMessageParameters as OfflineVerifyMessageParameters,
  type VerifyMessageReturnType as OfflineVerifyMessageReturnType,
} from '../../utils/signature/verifyMessage.js'
import { type CallParameters, call } from './call.js'
import { isBytesEqual } from '../../utils/data/isBytesEqual.js'
import { CallExecutionError } from '../../index.js'
import { universalSignatureValidatorAbi } from '../../constants/abis.js'
import { universalSignatureValidatorByteCode } from '../../constants/contracts.js'

export type VerifyMessageHashOnchainParameters = Pick<
  CallParameters,
  'blockNumber' | 'blockTag'
> & {
  address: Address
  messageHash: Hex
  signature: Hex | ByteArray
}

export type VerifyMessageHashOnchainReturnType = boolean

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
  const signatureHex = isHex(signature) ? signature : toHex(signature)

  try {
    const { data } = await call(client, {
      data: encodeDeployData({
        abi: universalSignatureValidatorAbi,
        args: [address, messageHash, signatureHex],
        bytecode: universalSignatureValidatorByteCode,
      }),
      ...callRequest,
    } as unknown as CallParameters)

    return isBytesEqual(data ?? '0x0', '0x1')
  } catch (error) {
    if (error instanceof CallExecutionError) {
      // if the execution fails, the signature was not valid and an internal method inside of the validator reverted
      // this can happen for many reasons, for example if signer can not be recovered from the signature
      // or if the signature has no valid format
      return false
    }

    throw error
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

  return verifyMessageHashOnChain(client, {
    address,
    messageHash,
    signature,
    ...callRequest,
  })
}
