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
  const firstMint = await Actions.token.mintSync(client, {
    amount: Value.from('12.5', 6),
    to: client.account.address,
    token,
  })
  const [firstBalance, firstMetadata] = await Promise.all([
    Actions.token.getBalance(client, {
      account: client.account.address,
      token,
    }),
    Actions.token.getMetadata(client, { token }),
  ])

  const secondMint = await Actions.token.mintSync(client, {
    amount: Value.from('3.25', 6),
    to: '0x4242424242424242424242424242424242424242',
    token,
  })
  const [secondBalance, secondMetadata] = await Promise.all([
    Actions.token.getBalance(client, {
      account: '0x4242424242424242424242424242424242424242',
      token,
    }),
    Actions.token.getMetadata(client, { token }),
  ])

  const burned = await Actions.token.burnSync(client, {
    amount: Value.from('4.25', 6),
    token,
  })
  const [burnBalance, burnMetadata] = await Promise.all([
    Actions.token.getBalance(client, {
      account: client.account.address,
      token,
    }),
    Actions.token.getMetadata(client, { token }),
  ])

  return {
    burn: {
      ...burned,
      balance: burnBalance.amount,
      totalSupply: burnMetadata.totalSupply,
    },
    first: {
      ...firstMint,
      balance: firstBalance.amount,
      totalSupply: firstMetadata.totalSupply,
    },
    second: {
      ...secondMint,
      balance: secondBalance.amount,
      totalSupply: secondMetadata.totalSupply,
    },
    token,
  }
}
