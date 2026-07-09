import type { Address, Hex, TransactionEnvelope as TxEnvelope } from 'ox'
import type { MultisigConfig } from 'ox/tempo'
import { expectTypeOf, test } from 'vitest'

import type { Account, Chain } from 'viem'
import { tempo } from 'viem/chains'

import type { Envelope, TransactionRequest } from './chainConfig.js'

test('ExtractTransactionRequest: native tempo request shape', () => {
  type Request = Chain.ExtractTransactionRequest<typeof tempo>

  expectTypeOf<Request>().toEqualTypeOf<TransactionRequest>()
  expectTypeOf<Request['feeToken']>().toEqualTypeOf<
    Address.Address | undefined
  >()
  expectTypeOf<Request['feePayer']>().toEqualTypeOf<
    Account.Account | boolean | undefined
  >()
  expectTypeOf<Request['keyType']>().toEqualTypeOf<
    'secp256k1' | 'p256' | 'webAuthn' | undefined
  >()
  expectTypeOf<Request['nonceKey']>().toEqualTypeOf<
    'expiring' | 'random' | bigint | undefined
  >()
  expectTypeOf<Request['multisig']>().toEqualTypeOf<
    MultisigConfig.Config | undefined
  >()
  // Numberish quantities (matching `TransactionRequest.toRpc.Input`).
  expectTypeOf<Request['gas']>().toEqualTypeOf<
    Hex.Hex | bigint | number | undefined
  >()
})

test('ExtractTransaction: tempo transaction converter output', () => {
  type Transaction = Chain.ExtractTransaction<typeof tempo>

  expectTypeOf<Transaction>().toHaveProperty('hash')
  // Tempo-specific fields decoded by the chain converter.
  type TempoTransaction = Extract<Transaction, { type: 'tempo' }>
  expectTypeOf<TempoTransaction>().toHaveProperty('calls')
  expectTypeOf<TempoTransaction>().toHaveProperty('feeToken')
})

test('ExtractTransactionReceipt: tempo receipt converter output', () => {
  type Receipt = Chain.ExtractTransactionReceipt<typeof tempo>

  expectTypeOf<Receipt>().toHaveProperty('transactionHash')
  expectTypeOf<Receipt>().toHaveProperty('feeToken')
})

test('transaction hooks: envelope round-trips through the chain type', () => {
  expectTypeOf(tempo.transaction.getSignPayload)
    .parameter(0)
    .toEqualTypeOf<Envelope | TxEnvelope.TxEnvelope>()
  expectTypeOf(tempo.transaction.serialize).returns.toEqualTypeOf<
    Hex.Hex | undefined
  >()
  expectTypeOf(tempo.transaction.toEnvelope).returns.toEqualTypeOf<
    Envelope | undefined
  >()
  expectTypeOf<Envelope['feePayer']>().toEqualTypeOf<
    Account.Account | boolean | undefined
  >()
})

test('chain assigns to the base Chain type', () => {
  expectTypeOf(tempo).toMatchTypeOf<Chain.Chain>()
  expectTypeOf(tempo.verifyHash).toMatchTypeOf<Chain.Chain.VerifyHash>()
})

test('extension record: feeToken and hardfork typed on the chain root', () => {
  const extended = tempo.extend({
    feeToken: '0x20c0000000000000000000000000000000000001',
  })
  expectTypeOf(extended.feeToken).toMatchTypeOf<
    Address.Address | undefined
  >()
  expectTypeOf<
    Chain.ExtractExtension<typeof tempo>['feeToken']
  >().toEqualTypeOf<Address.Address | undefined>()
})

test('MultisigInit shape', () => {
  expectTypeOf<
    NonNullable<TransactionRequest['multisigInit']>['owners']
  >().toEqualTypeOf<readonly { owner: Address.Address; weight: number }[]>()
})
