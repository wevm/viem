import { TransactionEnvelope } from 'ox'
import { expect, test } from 'vitest'

import { chainConfig, TxEnvelopeDeposit } from 'viem/op-stack'

const deposit = {
  from: '0x977f82a600a1414e583f7f13623f1ac5d58b1c0b',
  sourceHash:
    '0x18040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d7104319',
  type: 'deposit',
} as const satisfies TxEnvelopeDeposit.TxEnvelopeDeposit

test('configuration', () => {
  expect(chainConfig).toMatchObject({
    blockTime: 2_000,
    codecs: chainConfig.codecs,
    contracts: {
      gasPriceOracle: {
        address: '0x420000000000000000000000000000000000000F',
      },
      l1Block: {
        address: '0x4200000000000000000000000000000000000015',
      },
      l2CrossDomainMessenger: {
        address: '0x4200000000000000000000000000000000000007',
      },
      l2Erc721Bridge: {
        address: '0x4200000000000000000000000000000000000014',
      },
      l2StandardBridge: {
        address: '0x4200000000000000000000000000000000000010',
      },
      l2ToL1MessagePasser: {
        address: '0x4200000000000000000000000000000000000016',
      },
    },
  })
})

test('transaction.serialize: serializes deposit envelopes', () => {
  expect(chainConfig.transaction.serialize(deposit)).toBe(
    TxEnvelopeDeposit.serialize(deposit),
  )
})

test('transaction.serialize: delegates standard envelopes', () => {
  const envelope = {
    chainId: 1,
    maxFeePerGas: 1n,
    type: 'eip1559',
  } as const
  expect(chainConfig.transaction.serialize(envelope)).toBeUndefined()
  expect(TransactionEnvelope.serialize(envelope)).toMatchInlineSnapshot(
    `"0x02c90180800180808080c0"`,
  )
})
