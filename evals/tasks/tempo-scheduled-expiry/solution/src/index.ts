import { Actions, ContractError } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Account, Actions as tempo_Actions, Client, http } from 'viem/tempo'

const pathUsd = '0x20c0000000000000000000000000000000000000'
const client = Client.create({
  account: Account.fromSecp256k1(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  const { timestamp } = await Actions.block.get(client)
  const deadline = Number(timestamp) + 60
  const result = await tempo_Actions.token.transferSync(client, {
    amount: { decimals: 6, formatted: '10.5' },
    to: '0x4545454545454545454545454545454545454545',
    token: pathUsd,
    validBefore: deadline,
  })

  const expired = await tempo_Actions.token
    .transferSync(client, {
      amount: { decimals: 6, formatted: '3.25' },
      to: '0x4646464646464646464646464646464646464646',
      token: pathUsd,
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
