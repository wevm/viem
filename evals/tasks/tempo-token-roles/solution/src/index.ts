import { ContractError } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Account, Actions, Client, http } from 'viem/tempo'

const admin = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const minter = Account.fromSecp256k1(
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
)
const recipient = '0x4545454545454545454545454545454545454545'
const client = Client.create({
  account: admin,
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
    account: minter.address,
    role: 'issuer',
    token,
  })
  const grant = await Actions.token.grantRolesSync(client, {
    roles: ['issuer'],
    to: minter.address,
    token,
  })
  const granted = await Actions.token.hasRole(client, {
    account: minter.address,
    role: 'issuer',
    token,
  })
  const mint = await Actions.token.mintSync(client, {
    account: minter,
    amount: 25_000_000n,
    to: recipient,
    token,
  })
  const revoke = await Actions.token.revokeRolesSync(client, {
    from: minter.address,
    roles: ['issuer'],
    token,
  })
  const revoked = await Actions.token.hasRole(client, {
    account: minter.address,
    role: 'issuer',
    token,
  })
  const rejected = await Actions.token
    .mintSync(client, {
      account: minter,
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
