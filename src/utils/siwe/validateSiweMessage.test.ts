import { expect, test, vi } from 'vitest'

import type { SiweMessage } from './types.js'
import { validateSiweMessage } from './validateSiweMessage.js'

const message = {
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  chainId: 1,
  domain: 'example.com',
  nonce: 'foobarbaz',
  uri: 'https://example.com/path',
  version: '1',
} satisfies SiweMessage

test('default', () => {
  expect(
    validateSiweMessage({
      message,
    }),
  ).toBeTruthy()
})

test('behavior: invalid address', () => {
  expect(
    validateSiweMessage({
      message: {
        ...message,
        address: undefined,
      },
    }),
  ).toBeFalsy()
})

test('behavior: address mismatch', () => {
  expect(
    validateSiweMessage({
      address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
      message,
    }),
  ).toBeFalsy()
})

test('behavior: invalid address', () => {
  expect(
    validateSiweMessage({
      address: '0xfoobarbaz',
      message,
    }),
  ).toBeFalsy()
})

test('behavior: domain mismatch', () => {
  expect(
    validateSiweMessage({
      domain: 'viem.sh',
      message,
    }),
  ).toBeFalsy()
})

test('behavior: nonce mismatch', () => {
  expect(
    validateSiweMessage({
      nonce: 'f0obarbaz',
      message,
    }),
  ).toBeFalsy()
})

test('behavior: scheme mismatch', () => {
  expect(
    validateSiweMessage({
      scheme: 'http',
      message: {
        ...message,
        scheme: 'https',
      },
    }),
  ).toBeFalsy()
})

test('behavior: time is after expirationTime', () => {
  expect(
    validateSiweMessage({
      message: {
        ...message,
        expirationTime: new Date(Date.UTC(2024, 1, 1)),
      },
      time: new Date(Date.UTC(2025, 1, 1)),
    }),
  ).toBeFalsy()
})

test('behavior: time is before notBefore', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)))

  expect(
    validateSiweMessage({
      message: {
        ...message,
        notBefore: new Date(Date.UTC(2024, 1, 1)),
      },
      time: new Date(Date.UTC(2023, 1, 1)),
    }),
  ).toBeFalsy()

  vi.useRealTimers()
})
