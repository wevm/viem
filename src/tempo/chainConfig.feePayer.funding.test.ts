import * as Secp256k1 from 'ox/Secp256k1'
import { SignatureEnvelope, TxEnvelopeTempo } from 'ox/tempo'
import { tempoLocalnet } from 'viem/chains'
import { Account, Addresses, FundingSource, Transaction } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import * as Formatters from './Formatters.js'

const sender = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const feePayer = Account.fromSecp256k1(
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
)
const request = {
  account: { address: sender.address, type: 'json-rpc' },
  chainId: 1337,
  calls: [{ to: Addresses.pathUsd, data: '0x1234', value: 0n }],
  feePayer,
  feeToken: Addresses.pathUsd,
  gas: 1_000_000n,
  maxFeePerGas: 20_000_000_000n,
  maxPriorityFeePerGas: 0n,
  nonce: 0,
  nonceKey: 1n,
  requireFunds: [
    {
      token: Addresses.pathUsd,
      amount: 10n,
      sources: [FundingSource.dex({ tokenIn: Addresses.alphaUsd })],
    },
  ],
  validBefore: 4_000_000_000,
} as const
const envelope = tempoLocalnet.serializers.transactionEnvelope

for (const action of ['fillTransaction', 'signTransaction', 'estimateGas'])
  test(`keeps the local signer out of ${action}`, () => {
    const formatted = Formatters.formatTransactionRequest(
      { ...request },
      action,
    )
    expect(formatted.feePayer).toBe(true)
    expect(formatted.feeToken).toBe(
      action === 'signTransaction' ? undefined : request.feeToken,
    )
    expect(request.feePayer).toBe(feePayer)
  })

test('preserves sender signature and funding while adding fee-payer approval', async () => {
  const serializedTransaction = await sender.signTransaction({
    ...request,
    feePayer: true,
  })
  expect(serializedTransaction.startsWith('0x78')).toBe(true)
  const signed = TxEnvelopeTempo.deserialize(serializedTransaction as never)
  const serialized = await envelope({
    serializedTransaction,
    transaction: request as never,
  })
  expect(serialized.startsWith('0x76')).toBe(true)
  const result = TxEnvelopeTempo.deserialize(serialized as never)
  expect(result.signature).toEqual(signed.signature)
  expect(result.requireFunds).toEqual(signed.requireFunds)
  expect(result.feeToken).toBe(Addresses.pathUsd)
  expect(
    SignatureEnvelope.verify(result.signature!, {
      address: sender.address,
      payload: TxEnvelopeTempo.getSignPayload(result),
    }),
  ).toBe(true)
  expect(
    Secp256k1.verify({
      address: feePayer.address,
      payload: TxEnvelopeTempo.getFeePayerSignPayload(result, {
        sender: sender.address,
      }),
      signature: result.feePayerSignature!,
    }),
  ).toBe(true)
})

describe('rejects changed signed fields', () => {
  test.each([
    { chainId: 1 },
    { calls: [{ to: Addresses.alphaUsd }] },
    { gas: request.gas + 1n },
    { nonce: 1 },
    { nonceKey: 2n },
    { maxFeePerGas: request.maxFeePerGas + 1n },
    { validBefore: request.validBefore - 1 },
    { requireFunds: [] },
  ])('%o', async (change) => {
    const serializedTransaction = await sender.signTransaction({
      ...request,
      ...change,
      feePayer: true,
    })
    await expect(
      envelope({ serializedTransaction, transaction: request as never }),
    ).rejects.toThrow('Wallet signed a different transaction than requested.')
  })
})

test('rejects a different sender', async () => {
  const serializedTransaction = await feePayer.signTransaction({
    ...request,
    feePayer: true,
  })
  await expect(
    envelope({ serializedTransaction, transaction: request as never }),
  ).rejects.toThrow('Wallet transaction signature does not match the sender.')
})

test('rejects an unsigned envelope', async () => {
  const serializedTransaction = await Transaction.serialize({
    ...request,
    feePayer: true,
  })
  await expect(
    envelope({ serializedTransaction, transaction: request as never }),
  ).rejects.toThrow('Expected a sender-signed sponsored Tempo transaction.')
})

test('rejects an unsponsored envelope', async () => {
  const serializedTransaction = await sender.signTransaction({
    ...request,
    feePayer: undefined,
  })
  await expect(
    envelope({ serializedTransaction, transaction: request as never }),
  ).rejects.toThrow('Expected a sender-signed sponsored Tempo transaction.')
})

test('rejects a fee payer selected by the wallet', async () => {
  const serializedTransaction = await sender.signTransaction(request)
  await expect(
    envelope({ serializedTransaction, transaction: request as never }),
  ).rejects.toThrow('Expected a sender-signed sponsored Tempo transaction.')
})
