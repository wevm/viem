import type { Hex, Log } from 'ox'
import { describe, expectTypeOf, test } from 'vitest'

import type { getCallsStatus } from '../core/actions/wallet/getCallsStatus.js'
import * as Withdrawal from './Withdrawal.js'

describe('extractWithdrawalMessageLogs: log shape', () => {
  test('accepts EIP-5792 call receipt logs', () => {
    const logs: getCallsStatus.ReturnType['receipts'][number]['logs'] = []
    const [log] = Withdrawal.extractWithdrawalMessageLogs({ logs })

    expectTypeOf(log!.eventName).toEqualTypeOf<'MessagePassed'>()
    expectTypeOf(log!.args.withdrawalHash).toEqualTypeOf<Hex.Hex>()
    expectTypeOf(log!).not.toHaveProperty('blockHash')
  })

  test('preserves metadata for full logs', () => {
    const logs: readonly Log.Log[] = []
    const [log] = Withdrawal.extractWithdrawalMessageLogs({ logs })

    expectTypeOf(log!.blockHash).toEqualTypeOf<Hex.Hex>()
    expectTypeOf(log!.logIndex).toEqualTypeOf<number>()
  })
})

describe('getWithdrawals: log shape', () => {
  // Withdrawals are built from decoded args alone, so partial logs are fine.
  test('accepts EIP-5792 call receipt logs', () => {
    const logs: getCallsStatus.ReturnType['receipts'][number]['logs'] = []
    expectTypeOf(Withdrawal.getWithdrawals({ logs })).toEqualTypeOf<
      readonly Withdrawal.Withdrawal[]
    >()
  })
})
