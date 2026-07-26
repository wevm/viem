import { ContractError } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Account, Actions, Addresses, Client, Expiry, http } from 'viem/tempo'
import { Value } from 'viem/utils'

const root = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const accessKey = Account.fromSecp256k1(
  '0x5fe1a3c2f2f7cbb2e6c8e6b092de2e04ae0d24a655e42e15a4f0f37b78f4e989',
  { access: root },
)
const limit = Value.from('50', 6)

const client = Client.create({
  account: root,
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
    accessKey,
    expiry: Expiry.hours(1),
    limits: [{ limit, token: Addresses.pathUsd }],
  })
  const transfer = await Actions.token.transferSync(client, {
    account: accessKey,
    amount: Value.from('5', 6),
    keyAuthorization,
    to: '0x4242424242424242424242424242424242424242',
    token: Addresses.pathUsd,
  })
  const { remaining } = await Actions.accessKey.getRemainingLimit(client, {
    accessKey,
    token: Addresses.pathUsd,
  })
  const revocation = await Actions.accessKey.revokeSync(client, {
    accessKey,
  })
  const rejected = await Actions.token
    .transferSync(client, {
      account: accessKey,
      amount: Value.from('1', 6),
      to: '0x4242424242424242424242424242424242424242',
      token: Addresses.pathUsd,
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
  return { keyAuthorization, limit, rejected, remaining, revocation, transfer }
}
