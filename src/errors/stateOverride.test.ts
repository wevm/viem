import { expect, test } from 'vitest'

import {
  AccountStateConflictError,
  StateAssignmentConflictError,
} from './stateOverride.js'

test('AccountStateConflictError', () => {
  expect(
    new AccountStateConflictError({
      address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    }),
  ).toMatchInlineSnapshot(`
    [AccountStateConflictError: State for account "0xd8da6bf26964af9d7eed9e03e53415d37aa96045" is set multiple times.

    Version: viem@1.0.2]
  `)
})

test('StateAssignmentConflictError', () => {
  expect(new StateAssignmentConflictError()).toMatchInlineSnapshot(`
    [StateAssignmentConflictError: state and stateDiff are set on the same account.

    Version: viem@1.0.2]
  `)
})
