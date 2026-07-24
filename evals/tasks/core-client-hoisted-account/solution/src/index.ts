import { Actions, type Client } from 'viem'
import { type Address, Value } from 'viem/utils'

export function sendEth(client: Client.Client, options: sendEth.Options) {
  const { amountEther, to } = options
  return Actions.transaction.sendSync(client, {
    to,
    value: Value.fromEther(amountEther),
  })
}

export declare namespace sendEth {
  type Options = {
    amountEther: string
    to: Address.Address
  }
}
