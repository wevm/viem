import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'

/**
 * Adds an EVM chain to the wallet.
 *
 * @example
 * ```ts
 * import { Actions, Client, custom } from 'viem'
 * import { optimism } from 'viem/chains'
 *
 * const client = Client.create({
 *   transport: custom(window.ethereum!),
 * })
 * await Actions.chains.add(client, { chain: optimism })
 * ```
 */
export async function add(
  client: Client.Client,
  options: add.Options,
): Promise<void> {
  const { chain } = options
  const { id, name, nativeCurrency, rpcUrls, blockExplorers } = chain
  await client.request(
    {
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: Hex.fromNumber(id),
          chainName: name,
          nativeCurrency,
          rpcUrls: rpcUrls.default.http,
          blockExplorerUrls: blockExplorers
            ? Object.values(blockExplorers).map(({ url }) => url)
            : undefined,
        },
      ],
    },
    { dedupe: true, retryCount: 0 },
  )
}

export declare namespace add {
  type Options = {
    /** The chain to add to the wallet. */
    chain: Chain.Chain
  }

  type ErrorType = Errors.GlobalErrorType
}
