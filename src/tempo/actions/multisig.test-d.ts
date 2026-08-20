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

test('approval actions return transaction operations', async () => {
  const operation = await client.multisig.approveTransaction({
    account: owner,
    calls: [],
    multisig: account,
  })
  const operationSync = await client.multisig.approveTransactionSync({
    ...operation.request,
    account: owner,
  })

  expectTypeOf(operation).toMatchTypeOf<Multisig.Operation.Transaction>()
  expectTypeOf(operation.request.from).toEqualTypeOf<`0x${string}`>()
  expectTypeOf(operation.request.gas).toEqualTypeOf<bigint>()
  expectTypeOf(operationSync).toMatchTypeOf<Multisig.Operation.Transaction>()
  expectTypeOf(operationSync.request.gas).toEqualTypeOf<bigint>()
})
