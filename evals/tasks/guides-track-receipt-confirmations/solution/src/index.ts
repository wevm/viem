import { Actions, type Client } from 'viem'
import { type Address, type Hex, Value } from 'viem/utils'

export async function sendPaymentAndWait(
  client: Client.Client,
  options: sendPaymentAndWait.Options,
) {
  const { amountEther, to } = options
  const hash = await Actions.transaction.send(client, {
    to,
    value: Value.fromEther(amountEther),
  })
  return Actions.transaction.waitForReceipt(client, { hash }).receipt
}

export declare namespace sendPaymentAndWait {
  type Options = {
    amountEther: string
    to: Address.Address
  }
}

export async function getConfirmationCount(
  client: Client.Client,
  options: getConfirmationCount.Options,
): Promise<bigint> {
  return Actions.transaction.getConfirmations(client, { hash: options.hash })
}

export declare namespace getConfirmationCount {
  type Options = {
    hash: Hex.Hex
  }
}
