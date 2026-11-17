import { Provider } from 'ox'
import { expect, test } from 'vitest'
import { Client, custom } from 'viem'

import * as constants from '~test/constants.js'
import { getCapabilities } from './getCapabilities.js'

const client = Client.create({
  transport: custom(
    Provider.from({
      async request({ method, params }: any) {
        if (method === 'wallet_getCapabilities')
          return {
            '0x2105': {
              atomic: { status: 'supported' },
              unstable_addSubAccount: {
                keyTypes: [
                  'address',
                  'p256',
                  'webcrypto-p256',
                  'webauthn-p256',
                ],
                supported: true,
              },
              paymasterService: {
                supported: params?.[0] === constants.accounts[0].address,
              },
            },
            '0x14A34': {
              paymasterService: {
                supported: params?.[0] === constants.accounts[0].address,
              },
            },
          }
        return null
      },
    }),
  ),
})

test('default', async () => {
  expect(await getCapabilities(client)).toMatchInlineSnapshot(`
    {
      "8453": {
        "atomic": {
          "status": "supported",
        },
        "paymasterService": {
          "supported": false,
        },
        "unstable_addSubAccount": {
          "keyTypes": [
            "address",
            "p256",
            "webcrypto-p256",
            "webauthn-p256",
          ],
          "supported": true,
        },
      },
      "84532": {
        "paymasterService": {
          "supported": false,
        },
      },
    }
  `)
})

test('args: account', async () => {
  expect(
    await getCapabilities(client, { account: constants.accounts[0].address }),
  ).toMatchInlineSnapshot(`
    {
      "8453": {
        "atomic": {
          "status": "supported",
        },
        "paymasterService": {
          "supported": true,
        },
        "unstable_addSubAccount": {
          "keyTypes": [
            "address",
            "p256",
            "webcrypto-p256",
            "webauthn-p256",
          ],
          "supported": true,
        },
      },
      "84532": {
        "paymasterService": {
          "supported": true,
        },
      },
    }
  `)
})

test('args: chainId', async () => {
  expect(
    await getCapabilities(client, {
      account: constants.accounts[0].address,
      chainId: 8453,
    }),
  ).toMatchInlineSnapshot(`
    {
      "atomic": {
        "status": "supported",
      },
      "paymasterService": {
        "supported": true,
      },
      "unstable_addSubAccount": {
        "keyTypes": [
          "address",
          "p256",
          "webcrypto-p256",
          "webauthn-p256",
        ],
        "supported": true,
      },
    }
  `)
})

test('behavior: account on client', async () => {
  const client_2 = {
    ...client,
    account: constants.accounts[1].address,
  } as unknown as typeof client
  expect(await getCapabilities(client_2)).toMatchInlineSnapshot(`
    {
      "8453": {
        "atomic": {
          "status": "supported",
        },
        "paymasterService": {
          "supported": false,
        },
        "unstable_addSubAccount": {
          "keyTypes": [
            "address",
            "p256",
            "webcrypto-p256",
            "webauthn-p256",
          ],
          "supported": true,
        },
      },
      "84532": {
        "paymasterService": {
          "supported": false,
        },
      },
    }
  `)
})
