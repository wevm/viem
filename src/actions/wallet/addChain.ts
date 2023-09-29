import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type NumberToHexErrorType,
  numberToHex,
} from '../../utils/encoding/toHex.js'

export type AddChainParameters = {
  /** The chain to add to the wallet. */
  chain: Chain
}

export type AddChainErrorType =
  | RequestErrorType
  | NumberToHexErrorType
  | ErrorType

/**
 * Adds an EVM chain to the wallet.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/addChain.html
 * - JSON-RPC Methods: [`eth_addEthereumChain`](https://eips.ethereum.org/EIPS/eip-3085)
 *
 * @param client - Client to use
 * @param parameters - {@link AddChainParameters}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { optimism } from 'viem/chains'
 * import { addChain } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   transport: custom(window.ethereum),
 * })
 * await addChain(client, { chain: optimism })
 */
export async function addChain<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(client: Client<Transport, TChain, TAccount>, { chain }: AddChainParameters) {
  const { id, name, nativeCurrency, rpcUrls, blockExplorers } = chain
  await client.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: numberToHex(id),
        chainName: name,
        nativeCurrency,
        rpcUrls: rpcUrls.default.http,
        blockExplorerUrls: blockExplorers
          ? Object.values(blockExplorers).map(({ url }) => url)
          : undefined,
      },
    ],
  })
}
