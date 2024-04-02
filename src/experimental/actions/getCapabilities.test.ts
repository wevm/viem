import { expect, test } from 'vitest'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { getCapabilities } from './getCapabilities.js'

const client = createClient({
  transport: custom({
    async request({ method }) {
      if (method === 'wallet_getCapabilities')
        return {
          '0x2105': {
            paymasterService: {
              supported: true,
            },
            sessionKeys: {
              supported: true,
            },
          },
          '0x14A34': {
            paymasterService: {
              supported: true,
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
