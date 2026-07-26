import { ContractError } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Account, Actions, Client, http } from 'viem/tempo'
import { Value } from 'viem/utils'

const client = Client.create({
  account: Account.fromSecp256k1(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  const firstAmount = Value.from('1000', 6)
  const firstRecipient = '0x4242424242424242424242424242424242424242'
  const { token: firstToken } = await Actions.token.createSync(client, {
    currency: 'USD',
    name: 'Capped Coin',
    symbol: 'CAPA',
  })
  await Actions.token.grantRolesSync(client, {
    roles: ['issuer'],
    to: client.account.address,
    token: firstToken,
  })
  await Actions.token.setSupplyCapSync(client, {
    supplyCap: firstAmount,
    token: firstToken,
  })
  const firstMint = await Actions.token.mintSync(client, {
    amount: firstAmount,
    to: firstRecipient,
    token: firstToken,
  })
  const firstRejected = await Actions.token
    .mintSync(client, {
      amount: 1n,
      to: firstRecipient,
      token: firstToken,
    })
    .then(() => false)
    .catch((error: unknown) => {
      if (
        error instanceof ContractError.ContractFunctionExecutionError &&
        error.cause instanceof ContractError.ContractFunctionRevertedError
      )
        return true
      throw error
    })

  const secondAmount = Value.from('0.25', 6)
  const secondRecipient = '0x4343434343434343434343434343434343434343'
  const { token: secondToken } = await Actions.token.createSync(client, {
    currency: 'USD',
    name: 'Capped Coin B',
    symbol: 'CAPB',
  })
  await Actions.token.grantRolesSync(client, {
    roles: ['issuer'],
    to: client.account.address,
    token: secondToken,
  })
  await Actions.token.setSupplyCapSync(client, {
    supplyCap: secondAmount,
    token: secondToken,
  })
  const secondMint = await Actions.token.mintSync(client, {
    amount: secondAmount,
    to: secondRecipient,
    token: secondToken,
  })
  const secondRejected = await Actions.token
    .mintSync(client, {
      amount: 1n,
      to: secondRecipient,
      token: secondToken,
    })
    .then(() => false)
    .catch((error: unknown) => {
      if (
        error instanceof ContractError.ContractFunctionExecutionError &&
        error.cause instanceof ContractError.ContractFunctionRevertedError
      )
        return true
      throw error
    })

  return {
    first: { ...firstMint, rejected: firstRejected, token: firstToken },
    second: { ...secondMint, rejected: secondRejected, token: secondToken },
  }
}
