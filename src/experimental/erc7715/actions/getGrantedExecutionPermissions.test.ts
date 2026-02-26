import { expect, test } from 'vitest'
import { createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import { getGrantedExecutionPermissions } from './getGrantedExecutionPermissions.js'

const getClient = ({ onRequest }: { onRequest: (params: any) => void }) =>
  createClient({
    transport: custom({
      async request({ method, params }) {
        onRequest(params)
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
  })

test('default', async () => {
  const requests: any[] = []
  const client = getClient({
    onRequest(request) {
      requests.push(request)
    },
  })

  expect(await getGrantedExecutionPermissions(client)).toMatchInlineSnapshot(`
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
