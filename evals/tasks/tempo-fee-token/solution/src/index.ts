import type { Client } from 'viem'
import { Actions } from 'viem/tempo'
import type { Address } from 'viem/utils'

const pathUsd = '0x20c0000000000000000000000000000000000000'
const alphaUsd = '0x20c0000000000000000000000000000000000001'

export async function transferToken(
  client: Client.Client,
  options: transferToken.Options,
) {
  const { amount, to } = options
  const account = client.account
  if (!account) throw new Error('account is required')

  // AlphaUSD only becomes a valid fee token once the fee AMM has liquidity.
  await Actions.amm.mintSync(client, {
    feeToken: pathUsd,
    nonceKey: (1n << 255n) + 7n,
    to: account.address,
    userTokenAddress: alphaUsd,
    validatorTokenAddress: pathUsd,
    validatorTokenAmount: 1_000_000_000n,
  })

  return Actions.token.transferSync(client, {
    amount: { decimals: 6, formatted: amount },
    feeToken: alphaUsd,
    to,
    token: pathUsd,
  })
}

export declare namespace transferToken {
  type Options = {
    amount: string
    to: Address.Address
  }
}
