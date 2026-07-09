import { Address } from 'ox'
import type { Errors } from 'ox'

import type * as Capabilities from '../../Capabilities.js'
import type * as Client from '../../Client.js'
import type { Compute } from '../../internal/types.js'
import { requestAddresses } from './requestAddresses.js'

/**
 * Requests to connect account(s) with optional capabilities via
 * [ERC-7846 `wallet_connect`](https://github.com/ethereum/ERCs/blob/master/ERCS/erc-7846.md).
 *
 * Falls back to `eth_requestAccounts` when the wallet does not support
 * `wallet_connect` and no capabilities were requested.
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
 * const { accounts } = await Actions.wallet.connect(client)
 * ```
 */
export async function connect(
  client: Client.Client,
  options: connect.Options = {},
): Promise<connect.ReturnType> {
  const { capabilities } = options

  const response = await (async () => {
    try {
      return await client.request(
        {
          method: 'wallet_connect',
          params: [{ ...(capabilities ? { capabilities } : {}), version: '1' }],
        },
        { dedupe: true, retryCount: 0 },
      )
    } catch (error_) {
      const error = error_ as Errors.BaseError

      // If the wallet does not support `wallet_connect`, and no capabilities
      // were requested, attempt to use `eth_requestAccounts` instead.
      if (
        !capabilities &&
        (error.name === 'Provider.UnsupportedMethodError' ||
          error.name === 'RpcResponse.InvalidInputError' ||
          error.name === 'RpcResponse.InvalidParamsError' ||
          error.name === 'RpcResponse.MethodNotFoundError' ||
          error.name === 'RpcResponse.MethodNotSupportedError')
      ) {
        const addresses = await requestAddresses(client)
        return {
          accounts: addresses.map((address) => ({
            address,
            capabilities: {},
          })),
        }
      }

      throw error
    }
  })() as connect.ReturnType

  return {
    ...response,
    accounts: (response.accounts ?? []).map((account) => ({
      ...account,
      address: Address.checksum(account.address),
    })),
  }
}

export declare namespace connect {
  type Options = {
    /** Capabilities to request from the wallet. */
    capabilities?: Capabilities.Extract<'connect', 'Request'> | undefined
  }

  type ReturnType = Compute<{
    /** Connected accounts. */
    accounts: readonly Compute<{
      /** Address of the account. */
      address: Address.Address
      /** Capabilities granted or returned by the wallet. */
      capabilities?: Capabilities.Extract<'connect', 'ReturnType'> | undefined
    }>[]
  }>

  type ErrorType =
    | Address.checksum.ErrorType
    | requestAddresses.ErrorType
    | Errors.GlobalErrorType
}
