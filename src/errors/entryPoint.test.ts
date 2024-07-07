import { expect, test } from 'vitest'
import { BaseError } from './base.js'
import {
  InitCodeFailedError,
  InitCodeMustReturnSenderError,
  SenderAlreadyConstructedError,
  UnknownEntryPointError,
} from './entryPoint.js'

test('SenderAlreadyConstructedError', () => {
  expect(
    new SenderAlreadyConstructedError({
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
    }),
  ).toMatchInlineSnapshot(`
    [SenderAlreadyConstructedError: Smart Account has already been deployed.

    Remove the following properties and try again:
    \`factory\`
    \`factoryData\`

    Version: viem@x.y.z]
  `)

  expect(
    new SenderAlreadyConstructedError({
      initCode: '0x0000000000000000000000000000000000000000deadbeef',
    }),
  ).toMatchInlineSnapshot(`
    [SenderAlreadyConstructedError: Smart Account has already been deployed.

    Remove the following properties and try again:
    \`initCode\`

    Version: viem@x.y.z]
  `)
})

test('InitCodeFailedError', () => {
  expect(
    new InitCodeFailedError({
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
    }),
  ).toMatchInlineSnapshot(`
    [InitCodeFailedError: Failed to simulate deployment for Smart Account.

    factory: 0x0000000000000000000000000000000000000000
    factoryData: 0xdeadbeef

    Version: viem@x.y.z]
  `)

  expect(
    new InitCodeFailedError({
      initCode: '0x0000000000000000000000000000000000000000deadbeef',
    }),
  ).toMatchInlineSnapshot(`
    [InitCodeFailedError: Failed to simulate deployment for Smart Account.

    initCode: 0x0000000000000000000000000000000000000000deadbeef

    Version: viem@x.y.z]
  `)
})

test('InitCodeMustReturnSenderError', () => {
  expect(
    new InitCodeMustReturnSenderError({
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
      sender: '0x0000000000000000000000000000000000000000',
    }),
  ).toMatchInlineSnapshot(`
    [InitCodeMustReturnSenderError: Smart Account initialization does not return the expected sender.

    factory: 0x0000000000000000000000000000000000000000
    factoryData: 0xdeadbeef
    sender: 0x0000000000000000000000000000000000000000

    Version: viem@x.y.z]
  `)

  expect(
    new InitCodeMustReturnSenderError({
      initCode: '0x0000000000000000000000000000000000000000deadbeef',
      sender: '0x0000000000000000000000000000000000000000',
    }),
  ).toMatchInlineSnapshot(`
    [InitCodeMustReturnSenderError: Smart Account initialization does not return the expected sender.

    initCode: 0x0000000000000000000000000000000000000000deadbeef
    sender: 0x0000000000000000000000000000000000000000

    Version: viem@x.y.z]
  `)
})

test('UnknownEntryPointError', () => {
  expect(
    new UnknownEntryPointError({
      cause: new BaseError('test'),
    }),
  ).toMatchInlineSnapshot(`
    [UnknownEntryPointError: An error occurred while executing user operation: test

    Version: viem@x.y.z]
  `)
})
