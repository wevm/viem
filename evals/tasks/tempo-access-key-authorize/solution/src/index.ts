import { ContractError } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Account, Actions, Client, Expiry, http } from 'viem/tempo'
import { Value } from 'viem/utils'

const pathUsd = '0x20c0000000000000000000000000000000000000'
const root = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const accessKey = Account.fromP256(
  '0x1111111111111111111111111111111111111111111111111111111111111111',
  { access: root },
)

const client = Client.create({
  account: root,
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

const accessClient = Client.create({
  account: accessKey,
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  const authorization = await Actions.accessKey.authorizeSync(client, {
    accessKey,
    expiry: Expiry.hours(1),
    limits: [{ limit: Value.from('100', 6), token: pathUsd }],
  })
  const transfer = await Actions.token.transferSync(accessClient, {
    amount: { decimals: 6, formatted: '30.5' },
    feeToken: pathUsd,
    to: '0x5151515151515151515151515151515151515151',
    token: pathUsd,
  })
  const rejected = await Actions.token
    .transferSync(accessClient, {
      amount: { decimals: 6, formatted: '75' },
      feeToken: pathUsd,
      to: '0x5252525252525252525252525252525252525252',
      token: pathUsd,
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
  return { authorization, rejected, transfer }
}
