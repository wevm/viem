import { Account, Actions, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'
import type { Address } from 'viem/utils'

const client = Client.create({
  account: Account.fromSecp256k1(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

async function state(token: Address.Address, account = client.account.address) {
  const [balance, supply] = await Promise.all([
    Actions.token.getBalance(client, { account, decimals: 6, token }),
    Actions.token.getTotalSupply(client, { decimals: 6, token }),
  ])
  return { balance: balance.amount, totalSupply: supply.amount }
}

export async function example() {
  const { token } = await Actions.token.createSync(client, {
    currency: 'USD',
    name: 'Eval Supply Token',
    symbol: 'EVS',
  })
  await Actions.token.grantRolesSync(client, {
    roles: ['issuer'],
    to: client.account.address,
    token,
  })
  const firstReceipt = (
    await Actions.token.mintSync(client, {
      amount: { decimals: 6, formatted: '12.5' },
      to: client.account.address,
      token,
    })
  ).receipt
  const first = { receipt: firstReceipt, ...(await state(token)) }

  const secondReceipt = (
    await Actions.token.mintSync(client, {
      amount: { decimals: 6, formatted: '3.25' },
      to: '0x4242424242424242424242424242424242424242',
      token,
    })
  ).receipt
  const second = {
    receipt: secondReceipt,
    ...(await state(token, '0x4242424242424242424242424242424242424242')),
  }

  const burnReceipt = (
    await Actions.token.burnSync(client, {
      amount: { decimals: 6, formatted: '4.25' },
      token,
    })
  ).receipt
  const burn = { receipt: burnReceipt, ...(await state(token)) }
  return { burn, first, second, token }
}
