import { ContractError } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Account, Actions, Client, http } from 'viem/tempo'

const grantee = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const recipient = '0x4545454545454545454545454545454545454545'

const client = Client.create({
  account: Account.fromSecp256k1(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

const granteeClient = Client.create({
  account: Account.fromSecp256k1(
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  const { token } = await Actions.token.createSync(client, {
    currency: 'USD',
    name: 'Role Token',
    symbol: 'ROLE',
  })
  const before = await Actions.token.hasRole(client, {
    account: grantee,
    role: 'issuer',
    token,
  })
  const grant = await Actions.token.grantRolesSync(client, {
    roles: ['issuer'],
    to: grantee,
    token,
  })
  const granted = await Actions.token.hasRole(client, {
    account: grantee,
    role: 'issuer',
    token,
  })
  const mint = await Actions.token.mintSync(granteeClient, {
    amount: 25_000_000n,
    to: recipient,
    token,
  })
  const revoke = await Actions.token.revokeRolesSync(client, {
    from: grantee,
    roles: ['issuer'],
    token,
  })
  const revoked = await Actions.token.hasRole(client, {
    account: grantee,
    role: 'issuer',
    token,
  })
  const rejected = await Actions.token
    .mintSync(granteeClient, {
      amount: 1_000_000n,
      to: recipient,
      token,
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
  return { before, grant, granted, mint, rejected, revoke, revoked, token }
}
