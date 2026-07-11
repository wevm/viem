import { TypedData } from 'ox'
import type { Errors } from 'ox'

import type * as Client from '../Client.js'
import { verifyHash } from './verifyHash.js'

/**
 * Verifies that typed data was signed by the provided address, supporting
 * Smart Contract Accounts (ERC-1271/6492/8010) and Externally Owned Accounts.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const valid = await Actions.verifyTypedData(client, {
 *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   domain: { name: 'Ether Mail', version: '1', chainId: 1 },
 *   types: {
 *     Mail: [{ name: 'contents', type: 'string' }],
 *   },
 *   primaryType: 'Mail',
 *   message: { contents: 'hello world' },
 *   signature: '0x…',
 * })
 * ```
 */
export async function verifyTypedData<
  const typedData extends TypedData.TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
>(
  client: Client.Client,
  options: verifyTypedData.Options<typedData, primaryType>,
): Promise<verifyTypedData.ReturnType> {
  const {
    address,
    blockHash,
    blockNumber,
    blockTag,
    erc6492VerifierAddress,
    factory,
    factoryData,
    mode,
    multicallAddress,
    requestOptions,
    requireCanonical,
    signature,
    ...typedData
  } = options as verifyTypedData.Options

  return verifyHash(client, {
    address,
    blockHash,
    blockNumber,
    blockTag,
    erc6492VerifierAddress,
    factory,
    factoryData,
    hash: TypedData.getSignPayload(typedData as TypedData.encode.Value),
    mode,
    multicallAddress,
    requestOptions,
    requireCanonical,
    signature,
  } as verifyHash.Options)
}

export declare namespace verifyTypedData {
  type Options<
    typedData extends TypedData.TypedData | Record<string, unknown> =
      TypedData.TypedData,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  > = TypedData.encode.Value<typedData, primaryType> &
    Omit<verifyHash.Options, 'hash'>

  type ReturnType = boolean

  type ErrorType =
    | TypedData.getSignPayload.ErrorType
    | verifyHash.ErrorType
    | Errors.GlobalErrorType
}
