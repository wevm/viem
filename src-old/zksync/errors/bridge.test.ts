import { expect, test } from 'vitest'
import {
  BaseFeeHigherThanValueError,
  CannotClaimSuccessfulDepositError,
  L2BridgeNotFoundError,
  LogProofNotFoundError,
  TxHashNotFoundInLogsError,
  WithdrawalLogNotFoundError,
} from '../../zksync/errors/bridge.js'

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

test('CannotClaimSuccessfulDepositError', () => {
  const hash =
    '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
  expect(
    new CannotClaimSuccessfulDepositError({ hash }),
  ).toMatchInlineSnapshot(`
    [CannotClaimSuccessfulDepositError: Cannot claim successful deposit: ${hash}.
    
    Version: viem@x.y.z]
  `)
})

test('LogProofNotFoundError', () => {
  const hash =
    '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
  const index = 0
  expect(new LogProofNotFoundError({ hash, index })).toMatchInlineSnapshot(`
    [LogProofNotFoundError: Log proof not found for hash ${hash} and index ${index}.
    
    Version: viem@x.y.z]
  `)
})

test('L2BridgeNotFoundError', () => {
  expect(new L2BridgeNotFoundError()).toMatchInlineSnapshot(`
    [L2BridgeNotFoundError: L2 bridge address not found.
    
    Version: viem@x.y.z]
  `)
})
