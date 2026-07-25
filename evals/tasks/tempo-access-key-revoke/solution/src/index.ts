import { ContractError } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Account, Actions, Client, Expiry, http } from 'viem/tempo'

const pathUsd = '0x20c0000000000000000000000000000000000000'
const root = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const accessKey = Account.fromSecp256k1(
  '0x5fe1a3c2f2f7cbb2e6c8e6b092de2e04ae0d24a655e42e15a4f0f37b78f4e989',
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

async function remaining() {
  const result = await Actions.accessKey.getRemainingLimit(client, {
    accessKey: accessKey.address,
    account: root.address,
    token: pathUsd,
  })
  return result.remaining
}

export async function example() {
  const authorization = await Actions.accessKey.authorizeSync(client, {
    accessKey,
    expiry: Expiry.hours(1),
    feeToken: pathUsd,
    limits: [{ limit: 50_000_000n, token: pathUsd }],
  })
  const before = await remaining()
  const transfer = await Actions.token.transferSync(accessClient, {
    amount: 5_000_000n,
    feeToken: pathUsd,
    to: '0x4242424242424242424242424242424242424242',
    token: pathUsd,
  })
  const after = await remaining()
  const revocation = await Actions.accessKey.revokeSync(client, {
    accessKey: accessKey.address,
    feeToken: pathUsd,
  })
  const rejected = await Actions.token
    .transferSync(accessClient, {
      amount: 1_000_000n,
      feeToken: pathUsd,
      to: '0x4242424242424242424242424242424242424242',
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
  return { after, authorization, before, rejected, revocation, transfer }
}
