import type { Address, TypedData } from 'abitype'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import {
  type SignMessageParameters,
  type SignMessageReturnType,
  signMessage,
} from '../actions/signMessage.js'
import {
  type SignTypedDataParameters,
  type SignTypedDataReturnType,
  signTypedData,
} from '../actions/signTypedData.js'

export type SoladyActions<
  account extends Account | undefined = Account | undefined,
  verifier extends Address | undefined = Address | undefined,
> = {
  /**
   * Signs a [EIP-191](https://eips.ethereum.org/EIPS/eip-191) personal sign message via Solady's [ERC1271 `PersonalSign` format](https://github.com/Vectorized/solady/blob/678c9163550810b08f0ffb09624c9f7532392303/src/accounts/ERC1271.sol#L154-L166).
   *
   * This Action is suitable to sign messages for Smart Accounts that implement (or conform to) Solady's [ERC1271.sol](https://github.com/Vectorized/solady/blob/main/src/accounts/ERC1271.sol).
   *
   * - Docs: https://viem.sh/experimental/solady/signMessage
   *
   * With the calculated signature, you can:
   * - use [`verifyMessage`](https://viem.sh/docs/utilities/verifyMessage) to verify the signature,
   *
   * @param client - Client to use
   * @param parameters - {@link SignMessageParameters}
   * @returns The signed message. {@link SignMessageReturnType}
   *
   * @example
   * ```ts
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { soladyActions } from 'viem/experimental/solady'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(soladyActions())
   *
   * const signature = await client.signMessage({
   *   account: '0xE8Df82fA4E10e6A12a9Dab552bceA2acd26De9bb',
   *   message: 'hello world',
   *   verifier: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   * })
   * ```
   *
   * @example Account & Signer Hoisting
   * ```ts
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { soladyActions } from 'viem/experimental/solady'
   *
   * const client = createWalletClient({
   *   account: '0xE8Df82fA4E10e6A12a9Dab552bceA2acd26De9bb',
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(soladyActions({ verifier: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e' }))
   *
   * const signature = await client.signMessage({
   *   message: 'hello world',
   * })
   * ```
   */
  signMessage: <accountOverride extends Account | undefined = undefined>(
    parameters: SignMessageParameters<account, accountOverride, verifier>,
  ) => Promise<SignMessageReturnType>
  /**
   * Signs an [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed data message via Solady's [ERC1271 `TypedDataSign` format](https://github.com/Vectorized/solady/blob/678c9163550810b08f0ffb09624c9f7532392303/src/accounts/ERC1271.sol#L130-L151).
   *
   * This Action is suitable to sign messages for Smart Accounts that implement (or conform to) Solady's [ERC1271.sol](https://github.com/Vectorized/solady/blob/main/src/accounts/ERC1271.sol).
   *
   * - Docs: https://viem.sh/experimental/solady/signTypedData
   *
   * @param client - Client to use
   * @param parameters - {@link SignTypedDataParameters}
   * @returns The signed data. {@link SignTypedDataReturnType}
   *
   * @example
   * ```ts
   * import { createWalletClient, custom } from 'viem'
   * import { mainnet } from 'viem/chains'
   * import { soladyActions } from 'viem/experimental/solady'
   *
   * const client = createWalletClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(soladyActions())
   *
   * const signature = await client.signTypedData({
   *   account: '0xE8Df82fA4E10e6A12a9Dab552bceA2acd26De9bb',
   *   domain: {
   *     name: 'Ether Mail',
   *     version: '1',
   *     chainId: 1,
   *     verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
   *   },
   *   types: {
   *     Person: [
   *       { name: 'name', type: 'string' },
   *       { name: 'wallet', type: 'address' },
   *     ],
   *     Mail: [
   *       { name: 'from', type: 'Person' },
   *       { name: 'to', type: 'Person' },
   *       { name: 'contents', type: 'string' },
   *     ],
   *   },
   *   primaryType: 'Mail',
   *   message: {
   *     from: {
   *       name: 'Cow',
   *       wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
   *     },
   *     to: {
   *       name: 'Bob',
   *       wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
   *     },
   *     contents: 'Hello, Bob!',
   *   },
   *   verifier: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   * })
   * ```
   *
   * @example Account & Signer Hoisting
   * ```ts
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { mainnet } from 'viem/chains'
   * import { soladyActions } from 'viem/experimental/solady'
   *
   * const client = createWalletClient({
   *   account: '0xE8Df82fA4E10e6A12a9Dab552bceA2acd26De9bb',
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(soladyActions({ verifier: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e' }))
   *
   * const signature = await client.signTypedData({
   *   domain: {
   *     name: 'Ether Mail',
   *     version: '1',
   *     chainId: 1,
   *     verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
   *   },
   *   types: {
   *     Person: [
   *       { name: 'name', type: 'string' },
   *       { name: 'wallet', type: 'address' },
   *     ],
   *     Mail: [
   *       { name: 'from', type: 'Person' },
   *       { name: 'to', type: 'Person' },
   *       { name: 'contents', type: 'string' },
   *     ],
   *   },
   *   primaryType: 'Mail',
   *   message: {
   *     from: {
   *       name: 'Cow',
   *       wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
   *     },
   *     to: {
   *       name: 'Bob',
   *       wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
   *     },
   *     contents: 'Hello, Bob!',
   *   },
   * })
   * ```
   */
  signTypedData: <
    const typedData extends TypedData | Record<string, unknown>,
    primaryType extends keyof typedData | 'EIP712Domain',
    accountOverride extends Account | undefined = undefined,
  >(
    parameters: SignTypedDataParameters<
      typedData,
      primaryType,
      account,
      accountOverride
    >,
  ) => Promise<SignTypedDataReturnType>
}

export type SoladyActionsParameters<
  verifier extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
> = {
  verifier?: verifier | undefined
}

/**
 * A suite of Actions based on [Solady contracts](https://github.com/Vectorized/solady).
 *
 * @example
 * import { createPublicClient, createWalletClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { soladyActions } from 'viem/experimental'
 *
 * const walletClient = createWalletClient({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(soladyActions())
 *
 * const result = await walletClient.signMessage({...})
 */
export function soladyActions<verifier extends Address | undefined = undefined>(
  parameters: SoladyActionsParameters<verifier> = {},
) {
  const { verifier } = parameters
  return <
    transport extends Transport,
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  >(
    client: Client<transport, chain, account>,
  ): SoladyActions<account, verifier> => {
    return {
      signMessage: (parameters) =>
        signMessage(client, { verifier, ...parameters }),
      signTypedData: (parameters) =>
        signTypedData(client, { verifier, ...(parameters as any) }),
    }
  }
}
