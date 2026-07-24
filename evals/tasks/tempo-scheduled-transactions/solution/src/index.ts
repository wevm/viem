import type { Client } from 'viem'
import { Actions } from 'viem/tempo'
import type { Address } from 'viem/utils'

const pathUsd = '0x20c0000000000000000000000000000000000000'

export async function scheduleTransfer(
  client: Client.Client,
  options: scheduleTransfer.Options,
) {
  const { amount, to, validAfter } = options
  const transfer = {
    amount: { decimals: 6, formatted: amount },
    to,
    token: pathUsd,
  } as const
  const gas = await Actions.token.transfer.estimateGas(client, transfer)
  return Actions.token.transferSync(client, {
    ...transfer,
    gas,
    timeout: 60_000,
    validAfter,
  })
}

export declare namespace scheduleTransfer {
  type Options = {
    amount: string
    to: Address.Address
    validAfter: number
  }
}
