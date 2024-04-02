import { expect, test, vi } from 'vitest'
import { walletClient } from '../../../test/src/utils.js'
import type { EIP1193Parameters } from '../../types/eip1193.js'
import { getCapabilities } from './getCapabilities.js'

test('default', async () => {
  vi.spyOn(walletClient, 'request')
    // @ts-ignore
    .mockImplementation(async ({ method }: EIP1193Parameters) => {
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
    })

  const capabilities = await getCapabilities(walletClient)
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
