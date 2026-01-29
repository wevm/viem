import { expect, test } from 'vitest'
import { accounts } from '../../../../test/src/constants.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import { parseEther } from '../../../utils/index.js'
import { grantPermissions } from './grantPermissions.js'

const getClient = ({ onRequest }: { onRequest: (params: any) => void }) =>
  createClient({
    transport: custom({
      async request({ method, params }) {
        onRequest(params)
        if (method === 'wallet_grantPermissions')
          return {
            grantedPermissions: params[0].permissions,
            expiry: params[0].expiry,
            permissionsContext: '0xdeadbeef',
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
    await grantPermissions(client, {
      expiry: 1716846083638,
      permissions: [
        {
          type: 'native-token-transfer',
          data: {
            ticker: 'ETH',
          },
          policies: [
            {
              type: 'token-allowance',
              data: {
                allowance: parseEther('1'),
              },
            },
            {
              type: 'rate-limit',
              data: {
                count: 69,
                interval: 1,
              },
            },
            {
              type: { custom: 'foo' },
              data: { bar: 'baz' },
            },
          ],
        },
        {
          type: { custom: 'foo' },
          data: { bar: 'baz' },
          policies: [
            {
              type: 'gas-limit',
              data: {
                limit: parseEther('1'),
              },
            },
          ],
        },
      ],
    }),
  ).toMatchInlineSnapshot(`
    {
      "expiry": 1716846083638,
      "grantedPermissions": [
        {
          "data": {
            "ticker": "ETH",
          },
          "policies": [
            {
              "data": {
                "allowance": 1000000000000000000n,
              },
              "type": "token-allowance",
            },
            {
              "data": {
                "count": 69,
                "interval": 1,
              },
              "type": "rate-limit",
            },
            {
              "data": {
                "bar": "baz",
              },
              "type": "foo",
            },
          ],
          "required": false,
          "type": "native-token-transfer",
        },
        {
          "data": {
            "bar": "baz",
          },
          "policies": [
            {
              "data": {
                "limit": 1000000000000000000n,
              },
              "type": "gas-limit",
            },
          ],
          "required": false,
          "type": "foo",
        },
      ],
      "permissionsContext": "0xdeadbeef",
    }
  `)
  expect(requests).toMatchInlineSnapshot(`
    [
      [
        {
          "expiry": 1716846083638,
          "permissions": [
            {
              "data": {
                "ticker": "ETH",
              },
              "policies": [
                {
                  "data": {
                    "allowance": "0xde0b6b3a7640000",
                  },
                  "type": "token-allowance",
                },
                {
                  "data": {
                    "count": 69,
                    "interval": 1,
                  },
                  "type": "rate-limit",
                },
                {
                  "data": {
                    "bar": "baz",
                  },
                  "type": "foo",
                },
              ],
              "required": false,
              "type": "native-token-transfer",
            },
            {
              "data": {
                "bar": "baz",
              },
              "policies": [
                {
                  "data": {
                    "limit": "0xde0b6b3a7640000",
                  },
                  "type": "gas-limit",
                },
              ],
              "required": false,
              "type": "foo",
            },
          ],
        },
      ],
    ]
  `)
})

test('args: account (local)', async () => {
  const requests: any[] = []
  const client = getClient({
    onRequest(request) {
      requests.push(request)
    },
  })

  expect(
    await grantPermissions(client, {
      account: privateKeyToAccount(accounts[0].privateKey),
      expiry: 1716846083638,
      permissions: [
        {
          type: 'native-token-transfer',
          data: {
            ticker: 'ETH',
          },
          policies: [
            {
              type: 'token-allowance',
              data: {
                allowance: parseEther('1'),
              },
            },
            {
              type: 'rate-limit',
              data: {
                count: 69,
                interval: 1,
              },
            },
            {
              type: { custom: 'foo' },
              data: { bar: 'baz' },
            },
          ],
        },
        {
          type: { custom: 'foo' },
          data: { bar: 'baz' },
          policies: [],
        },
      ],
    }),
  ).toMatchInlineSnapshot(`
    {
      "expiry": 1716846083638,
      "grantedPermissions": [
        {
          "data": {
            "ticker": "ETH",
          },
          "policies": [
            {
              "data": {
                "allowance": 1000000000000000000n,
              },
              "type": "token-allowance",
            },
            {
              "data": {
                "count": 69,
                "interval": 1,
              },
              "type": "rate-limit",
            },
            {
              "data": {
                "bar": "baz",
              },
              "type": "foo",
            },
          ],
          "required": false,
          "type": "native-token-transfer",
        },
        {
          "data": {
            "bar": "baz",
          },
          "policies": [],
          "required": false,
          "type": "foo",
        },
      ],
      "permissionsContext": "0xdeadbeef",
    }
  `)
  expect(requests).toMatchInlineSnapshot(`
    [
      [
        {
          "expiry": 1716846083638,
          "permissions": [
            {
              "data": {
                "ticker": "ETH",
              },
              "policies": [
                {
                  "data": {
                    "allowance": "0xde0b6b3a7640000",
                  },
                  "type": "token-allowance",
                },
                {
                  "data": {
                    "count": 69,
                    "interval": 1,
                  },
                  "type": "rate-limit",
                },
                {
                  "data": {
                    "bar": "baz",
                  },
                  "type": "foo",
                },
              ],
              "required": false,
              "type": "native-token-transfer",
            },
            {
              "data": {
                "bar": "baz",
              },
              "policies": [],
              "required": false,
              "type": "foo",
            },
          ],
          "signer": {
            "data": {
              "id": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            },
            "type": "account",
          },
        },
      ],
    ]
  `)
})

test('args: account (json-rpc)', async () => {
  const requests: any[] = []
  const client = getClient({
    onRequest(request) {
      requests.push(request)
    },
  })

  expect(
    await grantPermissions(client, {
      account: accounts[0].address,
      expiry: 1716846083638,
      permissions: [
        {
          type: 'native-token-transfer',
          data: {
            ticker: 'ETH',
          },
          policies: [
            {
              type: 'token-allowance',
              data: {
                allowance: parseEther('1'),
              },
            },
            {
              type: 'rate-limit',
              data: {
                count: 69,
                interval: 1,
              },
            },
            {
              type: { custom: 'foo' },
              data: { bar: 'baz' },
            },
          ],
        },
        {
          type: { custom: 'foo' },
          data: { bar: 'baz' },
          policies: [],
        },
      ],
    }),
  ).toMatchInlineSnapshot(`
    {
      "expiry": 1716846083638,
      "grantedPermissions": [
        {
          "data": {
            "ticker": "ETH",
          },
          "policies": [
            {
              "data": {
                "allowance": 1000000000000000000n,
              },
              "type": "token-allowance",
            },
            {
              "data": {
                "count": 69,
                "interval": 1,
              },
              "type": "rate-limit",
            },
            {
              "data": {
                "bar": "baz",
              },
              "type": "foo",
            },
          ],
          "required": false,
          "type": "native-token-transfer",
        },
        {
          "data": {
            "bar": "baz",
          },
          "policies": [],
          "required": false,
          "type": "foo",
        },
      ],
      "permissionsContext": "0xdeadbeef",
    }
  `)
  expect(requests).toMatchInlineSnapshot(`
    [
      [
        {
          "expiry": 1716846083638,
          "permissions": [
            {
              "data": {
                "ticker": "ETH",
              },
              "policies": [
                {
                  "data": {
                    "allowance": "0xde0b6b3a7640000",
                  },
                  "type": "token-allowance",
                },
                {
                  "data": {
                    "count": 69,
                    "interval": 1,
                  },
                  "type": "rate-limit",
                },
                {
                  "data": {
                    "bar": "baz",
                  },
                  "type": "foo",
                },
              ],
              "required": false,
              "type": "native-token-transfer",
            },
            {
              "data": {
                "bar": "baz",
              },
              "policies": [],
              "required": false,
              "type": "foo",
            },
          ],
          "signer": {
            "type": "wallet",
          },
        },
      ],
    ]
  `)
})

test('args: signer', async () => {
  const requests: any[] = []
  const client = getClient({
    onRequest(request) {
      requests.push(request)
    },
  })

  expect(
    await grantPermissions(client, {
      expiry: 1716846083638,
      signer: {
        type: 'key',
        data: {
          id: '0x123',
        },
      },
      permissions: [
        {
          type: 'native-token-transfer',
          data: {
            ticker: 'ETH',
          },
          policies: [
            {
              type: 'token-allowance',
              data: {
                allowance: parseEther('1'),
              },
            },
            {
              type: 'rate-limit',
              data: {
                count: 69,
                interval: 1,
              },
            },
            {
              type: { custom: 'foo' },
              data: { bar: 'baz' },
            },
          ],
        },
        {
          type: { custom: 'foo' },
          data: { bar: 'baz' },
          policies: [
            {
              type: 'gas-limit',
              data: {
                limit: parseEther('1'),
              },
            },
          ],
        },
      ],
    }),
  ).toMatchInlineSnapshot(`
    {
      "expiry": 1716846083638,
      "grantedPermissions": [
        {
          "data": {
            "ticker": "ETH",
          },
          "policies": [
            {
              "data": {
                "allowance": 1000000000000000000n,
              },
              "type": "token-allowance",
            },
            {
              "data": {
                "count": 69,
                "interval": 1,
              },
              "type": "rate-limit",
            },
            {
              "data": {
                "bar": "baz",
              },
              "type": "foo",
            },
          ],
          "required": false,
          "type": "native-token-transfer",
        },
        {
          "data": {
            "bar": "baz",
          },
          "policies": [
            {
              "data": {
                "limit": 1000000000000000000n,
              },
              "type": "gas-limit",
            },
          ],
          "required": false,
          "type": "foo",
        },
      ],
      "permissionsContext": "0xdeadbeef",
    }
  `)
  expect(requests).toMatchInlineSnapshot(`
    [
      [
        {
          "expiry": 1716846083638,
          "permissions": [
            {
              "data": {
                "ticker": "ETH",
              },
              "policies": [
                {
                  "data": {
                    "allowance": "0xde0b6b3a7640000",
                  },
                  "type": "token-allowance",
                },
                {
                  "data": {
                    "count": 69,
                    "interval": 1,
                  },
                  "type": "rate-limit",
                },
                {
                  "data": {
                    "bar": "baz",
                  },
                  "type": "foo",
                },
              ],
              "required": false,
              "type": "native-token-transfer",
            },
            {
              "data": {
                "bar": "baz",
              },
              "policies": [
                {
                  "data": {
                    "limit": "0xde0b6b3a7640000",
                  },
                  "type": "gas-limit",
                },
              ],
              "required": false,
              "type": "foo",
            },
          ],
          "signer": {
            "data": {
              "id": "0x123",
            },
            "type": "key",
          },
        },
      ],
    ]
  `)
})
