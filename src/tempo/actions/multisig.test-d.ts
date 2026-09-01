import { tempoLocalnet } from 'viem/chains'
import {
  Account,
  Actions,
  createClient,
  type MultisigConfig,
  type MultisigOperation,
} from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

const owner = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)
const account = Account.fromMultisig({ address: 'infer', owners: [owner] })
const client = createClient({
  chain: tempoLocalnet,
  experimental_multisig: true,
})

test('wallet actions expose multisig operations', async () => {
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
  const config = await client.multisig.getConfig({ address: account.address })
  const operation = await client.multisig.getOperation({ hash })

  expectTypeOf(hash).toEqualTypeOf<`0x${string}`>()
  expectTypeOf(receipt.multisig).toEqualTypeOf<
    MultisigOperation.TransactionOperation | undefined
  >()
  expectTypeOf(transaction.multisig).toEqualTypeOf<
    MultisigOperation.TransactionOperation | undefined
  >()
  expectTypeOf(config).toEqualTypeOf<MultisigConfig.Config | null>()
  expectTypeOf(operation).toEqualTypeOf<MultisigOperation.Operation | null>()
})

test('updateConfig infers the current config', async () => {
  const parameters = {
    account,
    nextConfig: {
      owners: account.config.owners,
      threshold: account.config.threshold,
    },
  } as const

  const hash = await client.multisig.updateConfig(parameters)
  const explicitHash = await client.multisig.updateConfig({
    ...parameters,
    account: account.address,
    currentConfig: account.config,
    owner,
  })
  const result = await client.multisig.updateConfigSync(parameters)

  expectTypeOf(explicitHash).toEqualTypeOf<`0x${string}`>()
  expectTypeOf(hash).toEqualTypeOf<`0x${string}`>()
  expectTypeOf(result.config).toEqualTypeOf<MultisigConfig.Config>()
})

test('updateConfig.call requires the current config', () => {
  Actions.multisig.updateConfig.call({
    currentConfig: account.config,
    nextConfig: {
      owners: account.config.owners,
      threshold: account.config.threshold,
    },
  })

  // @ts-expect-error `call` cannot resolve a current config from a client.
  Actions.multisig.updateConfig.call({
    nextConfig: {
      owners: account.config.owners,
      threshold: account.config.threshold,
    },
  })
})
