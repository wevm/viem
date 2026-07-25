import { ContractError } from 'viem'
import { Account, Actions, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'
import { type Address, Value } from 'viem/utils'

const pathUsd = '0x20c0000000000000000000000000000000000000'
const client = Client.create({
  account: Account.fromSecp256k1(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: tempoLocalnet,
  feeToken: pathUsd,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

async function launch(options: {
  cap: string
  name: string
  symbol: string
  to: Address.Address
}) {
  const amount = Value.from(options.cap, 6)
  const { token } = await Actions.token.createSync(client, {
    currency: 'USD',
    name: options.name,
    symbol: options.symbol,
  })
  await Actions.token.grantRolesSync(client, {
    roles: ['issuer'],
    to: client.account.address,
    token,
  })
  await Actions.token.setSupplyCapSync(client, {
    supplyCap: amount,
    token,
  })
  const { receipt } = await Actions.token.mintSync(client, {
    amount,
    to: options.to,
    token,
  })
  const rejected = await Actions.token
    .mintSync(client, { amount: 1n, to: options.to, token })
    .then(() => false)
    .catch((error: unknown) => {
      if (
        error instanceof ContractError.ContractFunctionExecutionError &&
        error.cause instanceof ContractError.ContractFunctionRevertedError
      )
        return true
      throw error
    })
  return { receipt, rejected, token }
}

export async function example() {
  const first = await launch({
    cap: '1000',
    name: 'Capped Coin',
    symbol: 'CAPA',
    to: '0x4242424242424242424242424242424242424242',
  })
  const second = await launch({
    cap: '0.25',
    name: 'Capped Coin B',
    symbol: 'CAPB',
    to: '0x4343434343434343434343434343434343434343',
  })
  return { first, second }
}
