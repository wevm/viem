import { describe, expect, test } from 'vitest'

import { createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import { erc7715Actions } from './erc7715.js'

const client = createClient({
  transport: custom({
    async request({ method, params }) {
      if (method === 'wallet_requestExecutionPermissions')
        return params.map((param: any) => ({
          ...param,
          context: '0xdeadbeef',
          dependencies: [],
          delegationManager: '0xdb9B1e94B5b69Df7e401DDbedE43491141047dB3',
        }))

      if (method === 'wallet_getSupportedExecutionPermissions')
        return {
          'native-token-allowance': {
            chainIds: [1],
            ruleTypes: ['expiry'],
          },
          'erc20-token-allowance': {
            chainIds: [1],
            ruleTypes: [],
          },
        }

      if (method === 'wallet_getGrantedExecutionPermissions')
        return [
          {
            chainId: '1',
            from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            to: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            permission: {
              type: 'native-token-allowance',
              isAdjustmentAllowed: false,
              data: {
                allowance: '0x1DCD6500',
              },
            },
            rules: [
              {
                type: 'expiry',
                data: {
                  timestamp: 1577840461,
                },
              },
            ],
            context: '0xdeadbeef',
            dependencies: [],
            delegationManager: '0xdb9B1e94B5b69Df7e401DDbedE43491141047dB3',
          },
        ]
      return null
    },
  }),
}).extend(erc7715Actions())

test('default', async () => {
  expect(erc7715Actions()(client)).toMatchInlineSnapshot(`
    {
      "getGrantedExecutionPermissions": [Function],
      "getSupportedExecutionPermissions": [Function],
      "requestExecutionPermissions": [Function],
    }
  `)
})

describe('smoke test', () => {
  test('requestExecutionPermissions', async () => {
    expect(
      await client.requestExecutionPermissions([
        {
          chainId: 1,
          to: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          permission: {
            type: 'native-token-allowance',
            isAdjustmentAllowed: false,
            data: {
              allowance: '0x1DCD6500',
            },
          },
          rules: [
            {
              type: 'expiry',
              data: {
                timestamp: 1577840461,
              },
            },
          ],
        },
      ]),
    ).toMatchInlineSnapshot(`
      [
        {
          "chainId": 1,
          "context": "0xdeadbeef",
          "delegationManager": "0xdb9B1e94B5b69Df7e401DDbedE43491141047dB3",
          "dependencies": [],
          "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "permission": {
            "data": {
              "allowance": "0x1DCD6500",
            },
            "isAdjustmentAllowed": false,
            "type": "native-token-allowance",
          },
          "rules": [
            {
              "data": {
                "timestamp": 1577840461,
              },
              "type": "expiry",
            },
          ],
          "to": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        },
      ]
    `)
  })

  test('getSupportedExecutionPermissions', async () => {
    expect(
      await client.getSupportedExecutionPermissions(),
    ).toMatchInlineSnapshot(`
      {
        "erc20-token-allowance": {
          "chainIds": [
            1,
          ],
          "ruleTypes": [],
        },
        "native-token-allowance": {
          "chainIds": [
            1,
          ],
          "ruleTypes": [
            "expiry",
          ],
        },
      }
    `)
  })

  test('getGrantedExecutionPermissions', async () => {
    expect(
      await client.getGrantedExecutionPermissions(),
    ).toMatchInlineSnapshot(`
      [
        {
          "chainId": 1,
          "context": "0xdeadbeef",
          "delegationManager": "0xdb9B1e94B5b69Df7e401DDbedE43491141047dB3",
          "dependencies": [],
          "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "permission": {
            "data": {
              "allowance": "0x1DCD6500",
            },
            "isAdjustmentAllowed": false,
            "type": "native-token-allowance",
          },
          "rules": [
            {
              "data": {
                "timestamp": 1577840461,
              },
              "type": "expiry",
            },
          ],
          "to": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        },
      ]
    `)
  })
})
