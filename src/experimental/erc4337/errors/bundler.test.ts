import { expect, test } from 'vitest'
import { BaseError } from '../../../errors/base.js'
import {
  InitCodeFailedOrOutOfGasError,
  UnknownBundlerError,
} from './bundler.js'

test('InitCodeFailedOrOutOfGasError', () => {
  expect(
    new InitCodeFailedOrOutOfGasError({
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
    }),
  ).toMatchInlineSnapshot(`
    [InitCodeFailedOrOutOfGas: Failed to simulate deployment for Smart Account.

    factory: 0x0000000000000000000000000000000000000000
    factoryData: 0xdeadbeef

    Version: viem@x.y.z]
  `)
})

test('UnknownBundlerError', () => {
  expect(
    new UnknownBundlerError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [UnknownBundlerError: An error occurred while executing user operation: test

    Version: viem@x.y.z]
  `)
})
