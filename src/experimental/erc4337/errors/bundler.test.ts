import { expect, test } from 'vitest'
import { BaseError } from '../../../errors/base.js'
import { InitCodeFailedError, UnknownBundlerError } from './bundler.js'

test('InitCodeFailedError', () => {
  expect(
    new InitCodeFailedError({
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
    }),
  ).toMatchInlineSnapshot(`
    [InitCodeFailed: Failed to simulate deployment for Smart Account.

    factory: 0x0000000000000000000000000000000000000000
    factoryData: 0xdeadbeef

    Version: viem@x.y.z]
  `)

  expect(
    new InitCodeFailedError({
      initCode: '0x0000000000000000000000000000000000000000deadbeef',
    }),
  ).toMatchInlineSnapshot(`
    [InitCodeFailed: Failed to simulate deployment for Smart Account.

    initCode: 0x0000000000000000000000000000000000000000deadbeef

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
