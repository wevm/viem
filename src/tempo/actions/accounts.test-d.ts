import { tempoLocalnet } from 'viem/chains'
import {
  Account,
  type AccountConfig,
  type AccountOperation,
  Actions,
  createClient,
  http,
  Relay,
  Store,
  withRelay,
} from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

const owner = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)
const account = Account.fromConfig({ address: 'infer', owners: [owner] })
const client = createClient({
  chain: tempoLocalnet,
  transport: withRelay(http(), {
    plugins: [Relay.accounts({ store: Store.memory() })],
  }),
})

test('wallet actions expose account operations', async () => {
  const hash = await client.sendTransaction({
    account,
    calls: [],
    owner,
  })
  const receipt = await client.sendTransactionSync({
    account,
    hash,
    owner,
  })
  const transaction = await client.getTransaction({ hash })
  const config = await client.accounts.getConfig({ address: account.address })
  const operation = await client.accounts.getOperation({ hash })

  expectTypeOf(hash).toEqualTypeOf<`0x${string}`>()
  expectTypeOf(receipt.operation).toEqualTypeOf<
    AccountOperation.TransactionOperation | undefined
  >()
  expectTypeOf(transaction.operation).toEqualTypeOf<
    AccountOperation.TransactionOperation | undefined
  >()
  expectTypeOf(config).toEqualTypeOf<AccountConfig.Config | null>()
  expectTypeOf(operation).toEqualTypeOf<AccountOperation.Operation | null>()
})

test('updateConfig infers the current config', async () => {
  const parameters = {
    account,
    nextConfig: {
      owners: account.config.owners,
      threshold: account.config.threshold,
    },
  } as const

  const hash = await client.accounts.updateConfig(parameters)
  const explicitHash = await client.accounts.updateConfig({
    ...parameters,
    account: account.address,
    currentConfig: account.config,
    owner,
  })
  const result = await client.accounts.updateConfigSync(parameters)

  expectTypeOf(explicitHash).toEqualTypeOf<`0x${string}`>()
  expectTypeOf(hash).toEqualTypeOf<`0x${string}`>()
  expectTypeOf(result.config).toEqualTypeOf<AccountConfig.Config>()
})

test('updateConfig.call requires the current config', () => {
  Actions.accounts.updateConfig.call({
    currentConfig: account.config,
    nextConfig: {
      owners: account.config.owners,
      threshold: account.config.threshold,
    },
  })

  // @ts-expect-error `call` cannot resolve a current config from a client.
  Actions.accounts.updateConfig.call({
    nextConfig: {
      owners: account.config.owners,
      threshold: account.config.threshold,
    },
  })
})
