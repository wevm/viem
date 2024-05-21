import { expect, test, vi } from 'vitest'

import { accounts } from '~test/src/constants.js'

import { signMessage } from '../../accounts/utils/signMessage.js'
import { mainnet } from '../../chains/definitions/mainnet.js'
import { createSiweMessage } from './createSiweMessage.js'
import { verifySiweMessage } from './verifySiweMessage.js'

const account = accounts[0]

test('default', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)))

  const message = createSiweMessage({
    address: account.address,
    chainId: mainnet.id,
    domain: 'example.com',
    nonce: 'foobarbaz',
    uri: 'https://example.com/path',
    version: '1',
  })

  const signature = await signMessage({
    message,
    privateKey: account.privateKey,
  })
  expect(
    await verifySiweMessage({
      message,
      signature,
    }),
  ).toBeTruthy()

  vi.useRealTimers()
})

test('behavior: address mismatch', async () => {
  const message = createSiweMessage({
    address: account.address,
    chainId: mainnet.id,
    domain: 'example.com',
    nonce: 'foobarbaz',
    uri: 'https://example.com/path',
    version: '1',
  })

  const signature = await signMessage({
    message,
    privateKey: account.privateKey,
  })
  expect(
    await verifySiweMessage({
      address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
      message,
      signature,
    }),
  ).toBeFalsy()
})

test('behavior: domain mismatch', async () => {
  const message = createSiweMessage({
    address: account.address,
    chainId: mainnet.id,
    domain: 'example.com',
    nonce: 'foobarbaz',
    uri: 'https://example.com/path',
    version: '1',
  })

  const signature = await signMessage({
    message,
    privateKey: account.privateKey,
  })
  expect(
    await verifySiweMessage({
      domain: 'viem.sh',
      message,
      signature,
    }),
  ).toBeFalsy()
})

test('behavior: nonce mismatch', async () => {
  const message = createSiweMessage({
    address: account.address,
    chainId: mainnet.id,
    domain: 'example.com',
    nonce: 'foobarbaz',
    uri: 'https://example.com/path',
    version: '1',
  })

  const signature = await signMessage({
    message,
    privateKey: account.privateKey,
  })
  expect(
    await verifySiweMessage({
      nonce: 'foobarbaz2',
      message,
      signature,
    }),
  ).toBeFalsy()
})

test('behavior: scheme mismatch', async () => {
  const message = createSiweMessage({
    address: account.address,
    chainId: mainnet.id,
    domain: 'example.com',
    scheme: 'https',
    nonce: 'foobarbaz',
    uri: 'https://example.com/path',
    version: '1',
  })

  const signature = await signMessage({
    message,
    privateKey: account.privateKey,
  })
  expect(
    await verifySiweMessage({
      scheme: 'http',
      message,
      signature,
    }),
  ).toBeFalsy()
})

test('behavior: time is after expirationTime', async () => {
  const message = createSiweMessage({
    address: account.address,
    chainId: mainnet.id,
    domain: 'example.com',
    expirationTime: new Date(Date.UTC(2024, 1, 1)),
    nonce: 'foobarbaz',
    uri: 'https://example.com/path',
    version: '1',
  })

  const signature = await signMessage({
    message,
    privateKey: account.privateKey,
  })
  expect(
    await verifySiweMessage({
      scheme: 'foobarbaz2',
      message,
      signature,
    }),
  ).toBeFalsy()
})

test('behavior: time is before notBefore', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)))

  const message = createSiweMessage({
    address: account.address,
    chainId: mainnet.id,
    domain: 'example.com',
    nonce: 'foobarbaz',
    notBefore: new Date(Date.UTC(2024, 1, 1)),
    uri: 'https://example.com/path',
    version: '1',
  })

  const signature = await signMessage({
    message,
    privateKey: account.privateKey,
  })
  expect(
    await verifySiweMessage({
      nonce: 'foobarbaz2',
      message,
      signature,
    }),
  ).toBeFalsy()

  vi.useRealTimers()
})

test('behavior: invalid message', async () => {
  const message = 'foobarbaz'
  const signature = await signMessage({
    message,
    privateKey: account.privateKey,
  })
  expect(
    await verifySiweMessage({
      message,
      signature,
    }),
  ).toBeFalsy()
})
