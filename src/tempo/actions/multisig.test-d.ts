import { tempoLocalnet } from 'viem/chains'
import { Account, createClient, type Multisig } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

const owner = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)
const account = Account.fromMultisig({ owners: [owner] })
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

  expectTypeOf(hash).toEqualTypeOf<`0x${string}`>()
  expectTypeOf(receipt.multisig).toEqualTypeOf<
    Multisig.Operation.Transaction | undefined
  >()
  if (receipt.status === 'pending') {
    expectTypeOf(receipt.blockHash).toEqualTypeOf<null>()
    expectTypeOf(receipt.gasUsed).toEqualTypeOf<null>()
  } else {
    expectTypeOf(receipt.blockHash).toEqualTypeOf<`0x${string}`>()
    expectTypeOf(receipt.gasUsed).toEqualTypeOf<bigint>()
  }
  expectTypeOf(transaction.multisig).toEqualTypeOf<
    Multisig.Operation.Transaction | undefined
  >()
})
