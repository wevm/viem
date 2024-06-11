import { expect, test } from 'vitest'

import { accounts } from '../../../../test/src/constants.js'
import type { JsonRpcAccount } from '../../../accounts/types.js'
import { type Client, createClient } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { custom } from '../../../clients/transports/custom.js'
import type { Chain } from '../../../types/chain.js'
import { getCapabilities } from './getCapabilities.js'

const client = createClient({
  transport: custom({
    async request({ method, params }) {
      if (method === 'wallet_getCapabilities')
        return {
          '0x2105': {
            paymasterService: {
              supported: params[0] === accounts[0].address,
            },
            sessionKeys: {
              supported: true,
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
  const capabilities = await getCapabilities(client, {
    account: accounts[0].address,
  })
  expect(capabilities).toMatchInlineSnapshot(`
    {
      "8453": {
        "paymasterService": {
          "supported": true,
        },
        "sessionKeys": {
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

test('account on client', async () => {
  const client_2 = {
    ...client,
    account: accounts[1].address,
  } as unknown as Client<Transport, Chain, JsonRpcAccount>

  const capabilities = await getCapabilities(client_2)
  expect(capabilities).toMatchInlineSnapshot(`
    {
      "8453": {
        "paymasterService": {
          "supported": false,
        },
        "sessionKeys": {
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
