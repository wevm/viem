import { Hex } from 'ox'
import type { Address, Errors } from 'ox'

import * as Account from '../../Account.js'
import type * as Capabilities from '../../Capabilities.js'
import type * as Client from '../../Client.js'
import type { Compute } from '../../internal/types.js'

type ChainCapabilities = Capabilities.Extract<'getCapabilities', 'ReturnType'>

/**
 * Extracts capabilities that a connected wallet supports (e.g. paymasters,
 * session keys, etc).
 *
 * @example
 * ```ts
 * import { Actions, Client, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: custom(window.ethereum!),
 * })
 * const capabilities = await Actions.wallet.getCapabilities(client)
 * ```
 */
export async function getCapabilities<
  chainId extends number | undefined = undefined,
>(
  client: Client.Client,
  options: getCapabilities.Options<chainId> = {},
): Promise<getCapabilities.ReturnType<chainId>> {
  const { account = client.account, chainId } = options

  const account_ = account
    ? typeof account === 'string'
      ? Account.from(account)
      : account
    : undefined

  const params = chainId
    ? ([account_?.address, [Hex.fromNumber(chainId)]] as const)
    : ([account_?.address] as const)
  const capabilities_raw = await client.request({
    method: 'wallet_getCapabilities',
    params: params,
  })

  const capabilities = {} as Record<number, Record<string, unknown>>
  for (const [chainId, capabilities_] of Object.entries(capabilities_raw)) {
    capabilities[Number(chainId)] = {}
    for (let [key, value] of Object.entries(capabilities_ as object)) {
      if (key === 'addSubAccount') key = 'unstable_addSubAccount'
      capabilities[Number(chainId)]![key] = value
    }
  }
  return (
    typeof chainId === 'number' ? capabilities[chainId] : capabilities
  ) as never
}

export declare namespace getCapabilities {
  type Options<chainId extends number | undefined = undefined> = {
    /** Account (or address) to get capabilities for. @default client.account */
    account?: Account.Account | Address.Address | undefined
    /** Chain id to scope capabilities to. */
    chainId?: chainId | number | undefined
  }

  type ReturnType<chainId extends number | undefined = undefined> = Compute<
    chainId extends number
      ? ChainCapabilities
      : { [chainId: number]: ChainCapabilities }
  >

  type ErrorType = Account.from.ErrorType | Errors.GlobalErrorType
}
