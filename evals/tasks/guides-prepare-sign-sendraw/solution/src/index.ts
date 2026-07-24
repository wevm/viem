import { Actions, type Client } from 'viem'
import { type Address, Value } from 'viem/utils'

export async function sendRawPayment(
  client: Client.Client,
  options: sendRawPayment.Options,
) {
  const { amountEther, to } = options
  const { request } = await Actions.transaction.prepare(client, {
    to,
    value: Value.fromEther(amountEther),
  })
  const transaction = await Actions.transaction.sign(client, request)
  const hash = await Actions.transaction.sendRaw(client, { transaction })
  const receipt = await Actions.transaction.waitForReceipt(client, { hash })
    .receipt
  return { hash, receipt }
}

export declare namespace sendRawPayment {
  type Options = {
    amountEther: string
    to: Address.Address
  }
}
