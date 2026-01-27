import { expect, test } from 'vitest'
import { createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import { getSupportedExecutionPermissions } from './getSupportedExecutionPermissions.js'

const getClient = ({ onRequest }: { onRequest: (params: any) => void }) =>
  createClient({
    transport: custom({
      async request({ method, params }) {
        onRequest(params)
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

  expect(
    await getSupportedExecutionPermissions(client),
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
