import type { Chain } from '../../chains'
import type { WalletClient } from '../../clients'
import { numberToHex } from '../../utils'

export type SwitchChainArgs = { id: Chain['id'] }

export async function switchChain(
  client: WalletClient,
  { id }: SwitchChainArgs,
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
