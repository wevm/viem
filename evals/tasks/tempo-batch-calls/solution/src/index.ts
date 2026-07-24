import { Actions, type Client } from 'viem'
import { Actions as tempo_Actions } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'
import type { Address } from 'viem/utils'

const pathUsd = '0x20c0000000000000000000000000000000000000'

export async function approveAndTransfer(
  client: Client.Client<typeof tempoLocalnet>,
  options: approveAndTransfer.Options,
) {
  const { approveAmount, spender, to, transferAmount } = options
  const receipt = await Actions.transaction.sendSync(client, {
    calls: [
      tempo_Actions.token.approve.call({
        amount: { decimals: 6, formatted: approveAmount },
        spender,
        token: pathUsd,
      }),
      tempo_Actions.token.transfer.call({
        amount: { decimals: 6, formatted: transferAmount },
        to,
        token: pathUsd,
      }),
    ],
  })
  return { receipt }
}

export declare namespace approveAndTransfer {
  type Options = {
    approveAmount: string
    spender: Address.Address
    to: Address.Address
    transferAmount: string
  }
}
