import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'

import { verifyMessage } from '../../utils/index.js'
import { signMessage } from './signMessage.js'

test('default', async () => {
  const signature = await signMessage({
    message: 'hello world',
    privateKey: accounts[0].privateKey,
  })
  expect(
    await verifyMessage({
      address: accounts[0].address,
      message: 'hello world',
      signature,
    }),
  ).toBe(true)
})

test('raw', async () => {
  const signature = await signMessage({
    message: { raw: '0x68656c6c6f20776f726c64' },
    privateKey: accounts[0].privateKey,
  })
  expect(
    await verifyMessage({
      address: accounts[0].address,
      message: { raw: '0x68656c6c6f20776f726c64' },
      signature,
    }),
  ).toBe(true)

  {
    const signature = await signMessage({
      message: {
        raw: Uint8Array.from([
          104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
        ]),
      },
      privateKey: accounts[0].privateKey,
    })
    expect(
      await verifyMessage({
        address: accounts[0].address,
        message: {
          raw: Uint8Array.from([
            104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
          ]),
        },
        signature,
      }),
    ).toBe(true)
  }
})
