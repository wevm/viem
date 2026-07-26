import { ContractError } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Account, Actions, Client, http } from 'viem/tempo'
import { Value } from 'viem/utils'

const member = '0x4545454545454545454545454545454545454545'
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
    name: 'Gated USD',
    symbol: 'GUSD',
  })
  await Actions.token.grantRolesSync(client, {
    roles: ['issuer'],
    to: client.account.address,
    token,
  })
  await Actions.token.mintSync(client, {
    amount: Value.from('1000', 6),
    to: client.account.address,
    token,
  })
  const { policyId } = await Actions.policy.createSync(client, {
    addresses: [client.account.address],
    admin: client.account.address,
    type: 'whitelist',
  })
  await Actions.token.changeTransferPolicySync(client, { policyId, token })

  const rejected = await Actions.token
    .transferSync(client, {
      amount: Value.from('1', 6),
      to: '0x4646464646464646464646464646464646464646',
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
  await Actions.policy.modifyWhitelistSync(client, {
    address: member,
    allowed: true,
    policyId,
  })
  const transfer = await Actions.token.transferSync(client, {
    amount: Value.from('2.5', 6),
    to: member,
    token,
  })
  return { policyId, rejected, token, transfer }
}
