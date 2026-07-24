import { ContractError, type Client } from 'viem'
import { Actions } from 'viem/tempo'
import { type Address, Value } from 'viem/utils'

export async function launchCappedToken(
  client: Client.Client,
  options: launchCappedToken.Options,
) {
  const { cap, name, symbol, to } = options
  const amount = Value.from(cap, 6)
  const account = client.account
  if (!account) throw new Error('account is required')

  const { token } = await Actions.token.createSync(client, {
    currency: 'USD',
    name,
    symbol,
  })
  await Actions.token.grantRolesSync(client, {
    roles: ['issuer'],
    to: account.address,
    token,
  })
  await Actions.token.setSupplyCapSync(client, {
    supplyCap: amount,
    token,
  })

  const { receipt: mintReceipt } = await Actions.token.mintSync(client, {
    amount,
    to,
    token,
  })
  const overCapMintFailed = await Actions.token
    .mintSync(client, { amount: 1n, to, token })
    .then(() => false)
    .catch((error: unknown) => {
      if (error instanceof ContractError.ContractFunctionExecutionError)
        return true
      throw error
    })

  return { mintReceipt, overCapMintFailed, token }
}

export declare namespace launchCappedToken {
  type Options = {
    cap: string
    name: string
    symbol: string
    to: Address.Address
  }
}
