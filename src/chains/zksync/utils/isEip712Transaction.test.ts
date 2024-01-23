import { expect, test } from 'vitest'
import { isEIP712Transaction } from './isEip712Transaction.js'

test('true', () => {
  expect(
    isEIP712Transaction({
      type: 'eip712',
    }),
  ).toBeTruthy()
  expect(
    isEIP712Transaction({
      customSignature: '0x',
      from: '0x0000000000000000000000000000000000000000',
    }),
  ).toBeTruthy()
  expect(
    isEIP712Transaction({
      paymaster: '0x',
      from: '0x0000000000000000000000000000000000000000',
    }),
  ).toBeTruthy()
  expect(
    isEIP712Transaction({
      paymasterInput: '0x',
      from: '0x0000000000000000000000000000000000000000',
    }),
  ).toBeTruthy()
  expect(
    isEIP712Transaction({
      gasPerPubdata: 1n,
      from: '0x0000000000000000000000000000000000000000',
    }),
  ).toBeTruthy()
  expect(
    isEIP712Transaction({
      factoryDeps: ['0x'],
      from: '0x0000000000000000000000000000000000000000',
    }),
  ).toBeTruthy()
})

test('false', () => {
  expect(isEIP712Transaction({})).toBeFalsy()
  expect(
    isEIP712Transaction({
      type: 'eip1559',
    }),
  ).toBeFalsy()
  expect(
    isEIP712Transaction({
      from: '0x0000000000000000000000000000000000000000',
      to: '0x0000000000000000000000000000000000000000',
      value: 69n,
    }),
  ).toBeFalsy()
})
