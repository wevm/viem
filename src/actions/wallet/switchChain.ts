import type { Client, WalletClient } from '../../clients'
import type { Account, Chain } from '../../types'
import { numberToHex } from '../../utils'

export type SwitchChainParameters = { id: Chain['id'] }

export async function switchChain<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined = undefined,
>(
  client: WalletClient<TChain, TAccount> | Client<TChain>,
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
