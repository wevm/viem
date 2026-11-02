import { Hex } from 'ox'
import type { Errors } from 'ox'

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
          rpcUrls:
            typeof rpcUrls.http === 'string' ? [rpcUrls.http] : rpcUrls.http,
          blockExplorerUrls: blockExplorers ? [blockExplorers.url] : undefined,
        },
      ],
    },
    { dedupe: true, retryCount: 0 },
  )
}

export declare namespace add {
  type Options = {
    /** The chain to add to the wallet. `wallet_addEthereumChain` requires a name and RPC URLs. */
    chain: Chain.Chain & {
      name: string
      rpcUrls: Chain.Chain.RpcUrls
    }
  }

  type ErrorType = Errors.GlobalErrorType
}
