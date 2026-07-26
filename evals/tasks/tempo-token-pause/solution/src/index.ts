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
  const recipient = '0x4545454545454545454545454545454545454545'
  const { token } = await Actions.token.createSync(client, {
    currency: 'USD',
    name: 'Halt USD',
    symbol: 'HUSD',
  })
  await Actions.token.grantRolesSync(client, {
    roles: ['issuer', 'pause', 'unpause'],
    to: client.account.address,
    token,
  })
  await Actions.token.mintSync(client, {
    amount: Value.from('1000', 6),
    to: client.account.address,
    token,
  })
  await Actions.token.pauseSync(client, { token })
  const rejected = await Actions.token
    .transferSync(client, {
      amount: Value.from('5', 6),
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
  await Actions.token.unpauseSync(client, { token })
  const transfer = await Actions.token.transferSync(client, {
    amount: Value.from('12.5', 6),
    to: recipient,
    token,
  })
  return { rejected, token, transfer }
}
