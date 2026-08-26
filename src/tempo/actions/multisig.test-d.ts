import { tempoLocalnet } from 'viem/chains'
import {
  Account,
  createClient,
  type MultisigConfig,
  type MultisigOperation,
} from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

const owner = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)
const account = Account.fromMultisig({ address: 'initial', owners: [owner] })
const client = createClient({
  chain: tempoLocalnet,
  experimental_multisig: true,
})

test('wallet actions expose multisig operations', async () => {
  const hash = await client.sendTransaction({
    account: owner,
    calls: [],
    multisig: account,
  })
  const receipt = await client.sendTransactionSync({
    account: owner,
    hash,
  })
  const transaction = await client.getTransaction({ hash })
  const operation = await client.multisig.getOperation({ hash })

  expectTypeOf(hash).toEqualTypeOf<`0x${string}`>()
  expectTypeOf(receipt.multisig).toEqualTypeOf<
    MultisigOperation.TransactionOperation | undefined
  >()
  expectTypeOf(transaction.multisig).toEqualTypeOf<
    MultisigOperation.TransactionOperation | undefined
  >()
  expectTypeOf(operation).toEqualTypeOf<MultisigOperation.Operation | null>()
})

test('updateConfig accepts current and replacement configs', async () => {
  const parameters = {
    account,
    currentConfig: account.config,
    nextConfig: {
      owners: account.config.owners,
      threshold: account.config.threshold,
    },
  } as const

  const hash = await client.multisig.updateConfig(parameters)
  const result = await client.multisig.updateConfigSync(parameters)

  expectTypeOf(hash).toEqualTypeOf<`0x${string}`>()
  expectTypeOf(result.config).toEqualTypeOf<MultisigConfig.Config>()
})
