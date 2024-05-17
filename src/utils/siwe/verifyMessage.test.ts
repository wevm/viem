import { expect, test, vi } from 'vitest'

import { accounts } from '~test/src/constants.js'

import { signMessage } from '../../accounts/utils/signMessage.js'
import { mainnet } from '../../chains/definitions/mainnet.js'
import { createMessage } from './createMessage.js'
import { verifyMessage } from './verifyMessage.js'

const account = accounts[0]

test('default', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)))

  const message = createMessage({
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
    await verifyMessage({
      message,
      signature,
    }),
  ).toBeTruthy()

  vi.useRealTimers()
})

test.todo('parameters: address')
test.todo('parameters: domain')
test.todo('parameters: nonce')
test.todo('parameters: scheme')
test.todo('parameters: time')

test.todo('behavior: address mismatch')
test.todo('behavior: domain mismatch')
test.todo('behavior: nonce mismatch')
test.todo('behavior: scheme mismatch')
test.todo('behavior: time is after expirationTime')
test.todo('behavior: time is before notBefore')
