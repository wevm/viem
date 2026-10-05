import { Hex } from 'ox'
import type { Errors } from 'ox'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'

/**
 * Switches the target chain in a wallet.
 *
 * @example
 * ```ts
 * import { Actions, Client, custom } from 'viem'
 * import { mainnet, optimism } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: custom(window.ethereum!),
 * })
 * await Actions.chains.switch(client, { id: optimism.id })
 * ```
 */
async function switch_(
  client: Client.Client,
  options: switch_.Options,
): Promise<void> {
  const { id } = options
  await client.request(
    {
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: Hex.fromNumber(id) }],
    },
    { retryCount: 0 },
  )
}

declare namespace switch_ {
  type Options = {
    /** ID of the chain to switch to. */
    id: Chain.Chain['id']
  }

  type ErrorType = Errors.GlobalErrorType
}

export { switch_ as switch }
