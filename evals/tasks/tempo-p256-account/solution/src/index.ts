import type { Client } from 'viem'
import { Account, Actions, P256 } from 'viem/tempo'
import type { Address } from 'viem/utils'

const pathUsd = '0x20c0000000000000000000000000000000000000'

export async function transferFromNewAccount(
  client: Client.Client,
  options: transferFromNewAccount.Options,
) {
  const { amount, to } = options
  const account = Account.fromP256(P256.randomPrivateKey())
  await Actions.faucet.fundSync(client, { account, timeout: 60_000 })
  const { receipt } = await Actions.token.transferSync(client, {
    account,
    amount: { decimals: 6, formatted: amount },
    feeToken: pathUsd,
    to,
    token: pathUsd,
  })
  return { receipt, sender: account.address }
}

export declare namespace transferFromNewAccount {
  type Options = {
    amount: string
    to: Address.Address
  }
}
