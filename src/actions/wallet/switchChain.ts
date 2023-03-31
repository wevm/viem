import type { Transport, WalletClient } from '../../clients/index.js'
import type { Account, Chain } from '../../types/index.js'
import { numberToHex } from '../../utils/index.js'

export type SwitchChainParameters = { id: Chain['id'] }

export async function switchChain<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined = undefined,
>(
  client: WalletClient<Transport, TChain, TAccount>,
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
