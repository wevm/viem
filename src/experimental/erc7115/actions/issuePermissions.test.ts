import { expect, test } from 'vitest'
import { accounts } from '../../../../test/src/constants.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import { issuePermissions } from './issuePermissions.js'

const getClient = ({ onRequest }: { onRequest: (params: any) => void }) =>
  createClient({
    transport: custom({
      async request({ method, params }) {
        onRequest(params)
        if (method === 'wallet_issuePermissions')
          return {
            grantedPermissions: params[0].permissions.map(
              (permission: any) => ({
                type: permission.type,
                data: permission.data,
              }),
            ),
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
    await issuePermissions(client, {
      expiry: 1716846083638,
      signer: {
        type: 'account',
        data: {
          id: '0x0000000000000000000000000000000000000000',
        },
      },
      permissions: [
        {
          type: 'contract-call',
          data: {
            address: '0x0000000000000000000000000000000000000000',
          },
        },
        {
          type: 'native-token-limit',
          data: {
            amount: 69420n,
          },
          required: true,
        },
      ],
    }),
  ).toMatchInlineSnapshot(`
    {
      "expiry": 1716846083638,
      "grantedPermissions": [
        {
          "data": {
            "address": "0x0000000000000000000000000000000000000000",
          },
          "type": "contract-call",
        },
        {
          "data": {
            "amount": 69420n,
          },
          "type": "native-token-limit",
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
                "address": "0x0000000000000000000000000000000000000000",
              },
              "required": false,
              "type": "contract-call",
            },
            {
              "data": {
                "amount": "0x10f2c",
              },
              "required": true,
              "type": "native-token-limit",
            },
          ],
          "signer": {
            "data": {
              "id": "0x0000000000000000000000000000000000000000",
            },
            "type": "account",
          },
        },
      ],
    ]
  `)
})

test('args: account as signer', async () => {
  const requests: any[] = []
  const client = getClient({
    onRequest(request) {
      requests.push(request)
    },
  })

  expect(
    await issuePermissions(client, {
      account: privateKeyToAccount(accounts[0].privateKey),
      expiry: 1716846083638,
      permissions: [
        {
          type: 'contract-call',
          data: {
            address: '0x0000000000000000000000000000000000000000',
          },
        },
        {
          type: 'native-token-limit',
          data: {
            amount: 69420n,
          },
          required: true,
        },
      ],
    }),
  ).toMatchInlineSnapshot(`
    {
      "expiry": 1716846083638,
      "grantedPermissions": [
        {
          "data": {
            "address": "0x0000000000000000000000000000000000000000",
          },
          "type": "contract-call",
        },
        {
          "data": {
            "amount": 69420n,
          },
          "type": "native-token-limit",
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
                "address": "0x0000000000000000000000000000000000000000",
              },
              "required": false,
              "type": "contract-call",
            },
            {
              "data": {
                "amount": "0x10f2c",
              },
              "required": true,
              "type": "native-token-limit",
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

test('args: address as signer', async () => {
  const requests: any[] = []
  const client = getClient({
    onRequest(request) {
      requests.push(request)
    },
  })

  expect(
    await issuePermissions(client, {
      account: accounts[0].address,
      expiry: 1716846083638,
      permissions: [
        {
          type: 'contract-call',
          data: {
            address: '0x0000000000000000000000000000000000000000',
          },
        },
        {
          type: 'native-token-limit',
          data: {
            amount: 69420n,
          },
          required: true,
        },
      ],
    }),
  ).toMatchInlineSnapshot(`
    {
      "expiry": 1716846083638,
      "grantedPermissions": [
        {
          "data": {
            "address": "0x0000000000000000000000000000000000000000",
          },
          "type": "contract-call",
        },
        {
          "data": {
            "amount": 69420n,
          },
          "type": "native-token-limit",
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
                "address": "0x0000000000000000000000000000000000000000",
              },
              "required": false,
              "type": "contract-call",
            },
            {
              "data": {
                "amount": "0x10f2c",
              },
              "required": true,
              "type": "native-token-limit",
            },
          ],
          "signer": {
            "data": {
              "id": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            },
            "type": "account",
          },
        },
      ],
    ]
  `)
})
