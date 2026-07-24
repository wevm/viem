import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import type { Address } from 'viem/utils'

export const client = Client.create({
  blockTag: 'pending',
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export function getPendingBalance(
  client: Client.Client,
  options: getPendingBalance.Options,
) {
  return Actions.address.getBalance(client, { address: options.address })
}

export declare namespace getPendingBalance {
  type Options = {
    address: Address.Address
  }
}
