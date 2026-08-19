import type { Address } from 'abitype'
import { MultisigConfig } from 'ox/tempo'
import { expectTypeOf, test } from 'vitest'
import { prepareTransactionRequest } from '../actions/wallet/prepareTransactionRequest.js'
import { sendRawTransactionSync } from '../actions/wallet/sendRawTransactionSync.js'
import { tempoLocalnet } from '../chains/index.js'
import { createWalletClient } from '../clients/createWalletClient.js'
import { http } from '../clients/transports/http.js'
import type { Hash } from '../types/misc.js'

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

  // No explicit `type`: tempo-exclusive fields (`calls`/`feeToken`/`multisig`)
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
    multisig: config,
    multisigVersion: 1n,
  })
  expectTypeOf(request_multisig.type).toEqualTypeOf<'tempo'>()
  expectTypeOf(request_multisig.multisigVersion).toEqualTypeOf<
    bigint | undefined
  >()
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

test('sendRawTransactionSync returns pending multisig details', async () => {
  const client = createWalletClient({
    account: '0x',
    chain: tempoLocalnet,
    transport: http(),
  })

  const receipt = await sendRawTransactionSync(client, {
    serializedTransaction: '0x76',
  })

  expectTypeOf(receipt.blockHash).toEqualTypeOf<Hash>()
  expectTypeOf(receipt.multisigAccount).toEqualTypeOf<Address | undefined>()
  expectTypeOf(receipt.multisigSignatures).toEqualTypeOf<number | undefined>()
  expectTypeOf(receipt.multisigThreshold).toEqualTypeOf<number | undefined>()
  expectTypeOf(receipt.multisigWeight).toEqualTypeOf<number | undefined>()
  expectTypeOf(receipt.status).toEqualTypeOf<
    'pending' | 'reverted' | 'success'
  >()
})
