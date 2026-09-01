import { MultisigConfig, type MultisigSimulation } from 'ox/tempo'
import { Account, type Transaction } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'
import { privateKeyToAccount } from '../accounts/privateKeyToAccount.js'
import { prepareTransactionRequest } from '../actions/wallet/prepareTransactionRequest.js'
import { tempoLocalnet } from '../chains/index.js'
import { createWalletClient } from '../clients/createWalletClient.js'
import { http } from '../clients/transports/http.js'

test('prepareTransactionRequest preserves tempo transaction type', async () => {
  const client = createWalletClient({
    account: '0x',
    chain: tempoLocalnet,
    transport: http(),
  })

  const request_action = await prepareTransactionRequest(client, {
    calls: [],
    type: 'tempo',
  })
  const request_client = await client.prepareTransactionRequest({
    calls: [],
    type: 'tempo',
  })

  expectTypeOf(request_action.type).toEqualTypeOf<'tempo'>()
  expectTypeOf(request_client.type).toEqualTypeOf<'tempo'>()
})

test('prepareTransactionRequest defaults to tempo from tempo-only fields', async () => {
  const client = createWalletClient({
    account: '0x',
    chain: tempoLocalnet,
    transport: http(),
  })

  // No explicit `type`: tempo-exclusive fields (`calls`/`feeToken`/`owner`)
  // narrow the inferred type to `'tempo'`.
  const request_calls = await prepareTransactionRequest(client, { calls: [] })
  expectTypeOf(request_calls.type).toEqualTypeOf<'tempo'>()

  const request_feeToken = await prepareTransactionRequest(client, {
    feeToken: '0x20c0000000000000000000000000000000000000',
  })
  expectTypeOf(request_feeToken.type).toEqualTypeOf<'tempo'>()

  const config = MultisigConfig.from({
    threshold: 1,
    owners: [
      { owner: '0x0000000000000000000000000000000000000001', weight: 1 },
    ],
  })
  const request_multisig = await prepareTransactionRequest(client, {
    account: Account.fromMultisig({ address: 'infer', ...config }),
    owner: Account.fromSecp256k1(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    ),
  })
  expectTypeOf(request_multisig.type).toEqualTypeOf<'tempo'>()
  expectTypeOf(request_multisig.multisigSimulation).toEqualTypeOf<
    MultisigSimulation.Spec | undefined
  >()
})

test('behavior: prepareTransactionRequest rejects unsupported multisig owners', async () => {
  const client = createWalletClient({
    account: '0x',
    chain: tempoLocalnet,
    transport: http(),
  })
  const account = Account.fromMultisig({
    owners: [Account.fromSecp256k1(`0x${'1'.repeat(64)}`)],
  })

  await prepareTransactionRequest(client, {
    account,
    // @ts-expect-error Multisig owners must be local Tempo owner accounts.
    owner: account.address,
  })
  await prepareTransactionRequest(client, {
    account,
    // @ts-expect-error Ethereum accounts cannot approve Tempo multisig transactions.
    owner: privateKeyToAccount(`0x${'2'.repeat(64)}`),
  })
})

test('behavior: Tempo transaction owners are local Tempo accounts', () => {
  expectTypeOf<Transaction.TransactionRequestTempo['owner']>().toEqualTypeOf<
    Account.MultisigAccount | Account.RootAccount | undefined
  >()
  expectTypeOf<
    Transaction.TransactionSerializableTempo['owner']
  >().toEqualTypeOf<Account.MultisigAccount | Account.RootAccount | undefined>()
})

test('prepareTransactionRequest stays a union when ambiguous', async () => {
  const client = createWalletClient({
    account: '0x',
    chain: tempoLocalnet,
    transport: http(),
  })

  // No tempo-exclusive fields: the request matches both built-in and tempo
  // members, so it must NOT be narrowed to `'tempo'`.
  const request = await prepareTransactionRequest(client, {
    to: '0x0000000000000000000000000000000000000000',
    value: 1n,
  })
  expectTypeOf(request.type).toEqualTypeOf<
    'legacy' | 'eip2930' | 'eip1559' | 'eip4844' | 'eip7702' | 'tempo'
  >()
})
