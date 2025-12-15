import { expect, test } from 'vitest'

import { accounts } from '~test/constants.js'
import type { JsonRpcAccount } from '../../accounts/types.js'
import { type Client, createClient } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { custom } from '../../clients/transports/custom.js'
import type { Chain } from '../../types/chain.js'
import { getCapabilities } from './getCapabilities.js'

const client = createClient({
  transport: custom({
    async request({ method, params }) {
      if (method === 'wallet_getCapabilities')
        return {
          '0x2105': {
            atomic: {
              status: 'supported',
            },
            unstable_addSubAccount: {
              keyTypes: ['address', 'p256', 'webcrypto-p256', 'webauthn-p256'],
              supported: true,
            },
            paymasterService: {
              supported: params[0] === accounts[0].address,
            },
          },
          '0x14A34': {
            paymasterService: {
              supported: params[0] === accounts[0].address,
            },
          },
        }

      return null
    },
  }),
})

test('default', async () => {
  const capabilities = await getCapabilities(client)
  expect(capabilities).toMatchInlineSnapshot(`
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
  const capabilities = await getCapabilities(client, {
    account: accounts[0].address,
  })
  expect(capabilities).toMatchInlineSnapshot(`
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
  const capabilities = await getCapabilities(client, {
    account: accounts[0].address,
    chainId: 8453,
  })
  expect(capabilities).toMatchInlineSnapshot(`
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
    account: accounts[1].address,
  } as unknown as Client<Transport, Chain, JsonRpcAccount>

  const capabilities = await getCapabilities(client_2)
  expect(capabilities).toMatchInlineSnapshot(`
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
