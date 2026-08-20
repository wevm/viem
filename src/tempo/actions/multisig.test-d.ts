import { tempoLocalnet } from 'viem/chains'
import { Account, createClient, Multisig } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

const owner = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)
const account = Account.fromMultisig({ owners: [owner] })
const client = createClient({
  chain: tempoLocalnet,
  multisig: { store: Multisig.Store.memory() },
})

test('approval actions return transaction operations', async () => {
  const request = await client.prepareTransactionRequest({
    account,
    calls: [],
  })
  const operation = await client.multisig.approveTransaction({
    ...request,
    account: owner,
  })
  const operationSync = await client.multisig.approveTransactionSync({
    ...request,
    account: owner,
  })

  expectTypeOf(operation).toEqualTypeOf<Multisig.Operation.Transaction>()
  expectTypeOf(operationSync).toEqualTypeOf<Multisig.Operation.Transaction>()
})
