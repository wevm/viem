import { tempoLocalnet } from 'viem/chains'
import { Account, createClient, type MultisigOperation } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

const owner = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)
const account = Account.fromMultisig({ initialConfig: { owners: [owner] } })
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
