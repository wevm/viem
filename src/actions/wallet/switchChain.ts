import type { WalletClient } from '../../clients/index.js'
import type { Chain } from '../../types/index.js'
import { numberToHex } from '../../utils/index.js'

export type SwitchChainParameters = { id: Chain['id'] }

export async function switchChain(
  client: WalletClient,
  { id }: SwitchChainParameters,
) {
  await client.request({
    method: 'wallet_switchEthereumChain',
    params: [
      {
        chainId: numberToHex(id),
      },
    ],
  })
}
