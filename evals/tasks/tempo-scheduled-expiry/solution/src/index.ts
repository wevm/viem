import { ContractError } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Account, Actions, Addresses, Client, http } from 'viem/tempo'
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
  const { timestamp } = await client.block.get()
  const deadline = Number(timestamp) + 60
  const result = await Actions.token.transferSync(client, {
    amount: Value.from('10.5', 6),
    to: '0x4545454545454545454545454545454545454545',
    token: Addresses.pathUsd,
    validBefore: deadline,
  })

  const expired = await Actions.token
    .transferSync(client, {
      amount: Value.from('3.25', 6),
      to: '0x4646464646464646464646464646464646464646',
      token: Addresses.pathUsd,
      validBefore: Number(timestamp) - 10,
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

  return { deadline, expired, result }
}
