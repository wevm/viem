import { Actions, type Client } from 'viem'
import type { Address } from 'viem/utils'

export async function estimateTransferGas(
  client: Client.Client,
  options: estimateTransferGas.Options,
): Promise<bigint> {
  const { from, to, value } = options
  return Actions.transaction.estimateGas(client, { account: from, to, value })
}

export declare namespace estimateTransferGas {
  type Options = {
    from: Address.Address
    to: Address.Address
    value: bigint
  }
}

export async function estimateFees(client: Client.Client) {
  return Actions.fee.estimateFeesPerGas(client)
}
