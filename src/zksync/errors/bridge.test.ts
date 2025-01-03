import { expect, test } from 'vitest'
import {
  BaseFeeHigherThanValueError,
  TxHashNotFoundInLogsError,
} from '~viem/zksync/errors/bridge.js'

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
