import type { Hex, Log } from 'ox'
import { describe, expectTypeOf, test } from 'vitest'

import type { getCallsStatus } from '../core/actions/wallet/getCallsStatus.js'
import * as Deposit from './Deposit.js'

describe('extractTransactionDepositedLogs: log shape', () => {
  test('accepts EIP-5792 call receipt logs', () => {
    const logs: getCallsStatus.ReturnType['receipts'][number]['logs'] = []
    const [log] = Deposit.extractTransactionDepositedLogs({ logs })

    expectTypeOf(log!.eventName).toEqualTypeOf<'TransactionDeposited'>()
    expectTypeOf(log!.args.opaqueData).toEqualTypeOf<Hex.Hex>()
    expectTypeOf(log!).not.toHaveProperty('blockHash')
  })

  test('preserves metadata for full logs', () => {
    const logs: readonly Log.Log[] = []
    const [log] = Deposit.extractTransactionDepositedLogs({ logs })

    expectTypeOf(log!.blockHash).toEqualTypeOf<Hex.Hex>()
    expectTypeOf(log!.logIndex).toEqualTypeOf<number>()
  })
})

describe('getL2TransactionHashes: log shape', () => {
  test('rejects EIP-5792 call receipt logs', () => {
    const logs: getCallsStatus.ReturnType['receipts'][number]['logs'] = []
    // @ts-expect-error - partial logs cannot produce a source hash
    Deposit.getL2TransactionHashes({ logs })
  })

  test('accepts full logs', () => {
    const logs: readonly Log.Log[] = []
    expectTypeOf(Deposit.getL2TransactionHashes({ logs })).toEqualTypeOf<
      readonly Hex.Hex[]
    >()
  })
})
