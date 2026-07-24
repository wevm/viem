import { Actions, type Client } from 'viem'
import type { Address, Hex } from 'viem/utils'

const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

export async function seedUsdc(
  client: Client.Client,
  options: seedUsdc.Options,
): Promise<Hex.Hex> {
  const { amount, to } = options
  const account = client.account
  if (!account) throw new Error('client account required')

  await Actions.address.impersonate(client, { address: account.address })
  try {
    const hash = await Actions.token.transfer(client, {
      amount,
      to,
      token: usdc,
    })
    await Actions.transaction.waitForReceipt(client, { hash }).receipt
    return hash
  } finally {
    await Actions.address.stopImpersonating(client, {
      address: account.address,
    })
  }
}

export declare namespace seedUsdc {
  type Options = {
    amount: bigint
    to: Address.Address
  }
}
