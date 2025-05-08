import { expect, test } from 'vitest'
import {
  BaseFeeHigherThanValueError,
  TxHashNotFoundInLogsError,
  WithdrawalLogNotFoundError,
} from '~zkr-viem/zksync/errors/bridge.js'

test('BaseFeeHigherThanValueError', () => {
  expect(new BaseFeeHigherThanValueError(100n, 90n)).toMatchInlineSnapshot(`
    [BaseFeeHigherThanValueError: The base cost of performing the priority operation is higher than the provided transaction value parameter.

    Base cost: ${100}.
    Provided value: ${90}.

    Version: viem@x.y.z]
  `)
})

test('TxHashNotFoundInLogsError', () => {
  expect(new TxHashNotFoundInLogsError()).toMatchInlineSnapshot(`
    [TxHashNotFoundInLogsError: The transaction hash not found in event logs.

    Version: viem@x.y.z]
  `)
})

test('WithdrawalLogNotFoundError', () => {
  const hash =
    '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
  expect(new WithdrawalLogNotFoundError({ hash })).toMatchInlineSnapshot(`
    [WithdrawalLogNotFoundError: Withdrawal log with hash ${hash} not found.

    Either the withdrawal transaction is still processing or it did not finish successfully.
    
    Version: viem@x.y.z]
  `)
})
