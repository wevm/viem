import { describe, expect, test } from 'vitest'
import { accounts } from '~test/constants.js'
import { mainnet } from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import { parseEther } from '../../../utils/index.js'
import { sendCalls } from './sendCalls.js'

const getClient = ({
  onRequest,
}: {
  onRequest({ method, params }: { method: string; params: unknown }): void
}) =>
  createClient({
    chain: mainnet,
    transport: custom({
      async request({ method, params }) {
        onRequest({ method, params })
        if (method === 'wallet_sendCalls') {
          return { id: 'test-id' }
        }
        return null
      },
    }),
  })

describe('sendCalls with gasLimitOverride', () => {
  test('calls without gas - no gasLimitOverride capability', async () => {
    const requests: unknown[] = []

    const client = getClient({
      onRequest(request) {
        requests.push(request)
      },
    })

    await sendCalls(client, {
      account: accounts[0].address,
      calls: [
        {
          to: accounts[1].address,
          value: parseEther('1'),
        },
        {
          to: accounts[2].address,
          data: '0xcafebabe',
        },
      ],
    })

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "wallet_sendCalls",
          "params": [
            {
              "atomicRequired": false,
              "calls": [
                {
                  "capabilities": undefined,
                  "data": undefined,
                  "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
                  "value": "0xde0b6b3a7640000",
                },
                {
                  "capabilities": undefined,
                  "data": "0xcafebabe",
                  "to": "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
                  "value": undefined,
                },
              ],
              "capabilities": undefined,
              "chainId": "0x1",
              "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
              "id": undefined,
              "version": "2.0.0",
            },
          ],
        },
      ]
    `)
  })

  test('calls with gas - gasLimitOverride capability added', async () => {
    const requests: unknown[] = []

    const client = getClient({
      onRequest(request) {
        requests.push(request)
      },
    })

    await sendCalls(client, {
      account: accounts[0].address,
      calls: [
        {
          to: accounts[1].address,
          value: parseEther('1'),
          gas: 100000n,
        },
        {
          to: accounts[2].address,
          data: '0xcafebabe',
          gas: 200000n,
        },
      ],
    })

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "wallet_sendCalls",
          "params": [
            {
              "atomicRequired": false,
              "calls": [
                {
                  "capabilities": {
                    "gasLimitOverride": {
                      "value": "0x186a0",
                    },
                  },
                  "data": undefined,
                  "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
                  "value": "0xde0b6b3a7640000",
                },
                {
                  "capabilities": {
                    "gasLimitOverride": {
                      "value": "0x30d40",
                    },
                  },
                  "data": "0xcafebabe",
                  "to": "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
                  "value": undefined,
                },
              ],
              "capabilities": undefined,
              "chainId": "0x1",
              "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
              "id": undefined,
              "version": "2.0.0",
            },
          ],
        },
      ]
    `)
  })

  test('mixed calls - some with gas, some without', async () => {
    const requests: unknown[] = []

    const client = getClient({
      onRequest(request) {
        requests.push(request)
      },
    })

    await sendCalls(client, {
      account: accounts[0].address,
      calls: [
        {
          to: accounts[1].address,
          value: parseEther('1'),
          gas: 100000n,
        },
        {
          to: accounts[2].address,
          data: '0xcafebabe',
        },
        {
          to: accounts[3].address,
          value: parseEther('0.5'),
          gas: 50000n,
        },
      ],
    })

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "wallet_sendCalls",
          "params": [
            {
              "atomicRequired": false,
              "calls": [
                {
                  "capabilities": {
                    "gasLimitOverride": {
                      "value": "0x186a0",
                    },
                  },
                  "data": undefined,
                  "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
                  "value": "0xde0b6b3a7640000",
                },
                {
                  "capabilities": undefined,
                  "data": "0xcafebabe",
                  "to": "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
                  "value": undefined,
                },
                {
                  "capabilities": {
                    "gasLimitOverride": {
                      "value": "0xc350",
                    },
                  },
                  "data": undefined,
                  "to": "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
                  "value": "0x6f05b59d3b20000",
                },
              ],
              "capabilities": undefined,
              "chainId": "0x1",
              "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
              "id": undefined,
              "version": "2.0.0",
            },
          ],
        },
      ]
    `)
  })

  test('returns response id', async () => {
    const client = getClient({
      onRequest() {},
    })

    const result = await sendCalls(client, {
      account: accounts[0].address,
      calls: [
        {
          to: accounts[1].address,
          value: parseEther('1'),
          gas: 100000n,
        },
      ],
    })

    expect(result).toMatchInlineSnapshot(`
      {
        "id": "test-id",
      }
    `)
  })

  test('batch-level capabilities are preserved', async () => {
    const requests: unknown[] = []

    const client = getClient({
      onRequest(request) {
        requests.push(request)
      },
    })

    await sendCalls(client, {
      account: accounts[0].address,
      calls: [
        {
          to: accounts[1].address,
          value: parseEther('1'),
          gas: 100000n,
        },
      ],
      capabilities: {
        paymasterService: {
          url: 'https://paymaster.example.com',
        },
      },
    })

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "wallet_sendCalls",
          "params": [
            {
              "atomicRequired": false,
              "calls": [
                {
                  "capabilities": {
                    "gasLimitOverride": {
                      "value": "0x186a0",
                    },
                  },
                  "data": undefined,
                  "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
                  "value": "0xde0b6b3a7640000",
                },
              ],
              "capabilities": {
                "paymasterService": {
                  "url": "https://paymaster.example.com",
                },
              },
              "chainId": "0x1",
              "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
              "id": undefined,
              "version": "2.0.0",
            },
          ],
        },
      ]
    `)
  })

  test('with abi encoding', async () => {
    const requests: unknown[] = []

    const client = getClient({
      onRequest(request) {
        requests.push(request)
      },
    })

    await sendCalls(client, {
      account: accounts[0].address,
      calls: [
        {
          to: accounts[1].address,
          abi: [
            {
              name: 'transfer',
              type: 'function',
              inputs: [
                { name: 'to', type: 'address' },
                { name: 'amount', type: 'uint256' },
              ],
              outputs: [{ type: 'bool' }],
            },
          ] as const,
          functionName: 'transfer',
          args: [accounts[2].address, parseEther('1')],
          gas: 100000n,
        },
      ],
    })

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "wallet_sendCalls",
          "params": [
            {
              "atomicRequired": false,
              "calls": [
                {
                  "capabilities": {
                    "gasLimitOverride": {
                      "value": "0x186a0",
                    },
                  },
                  "data": "0xa9059cbb0000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc0000000000000000000000000000000000000000000000000de0b6b3a7640000",
                  "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
                  "value": undefined,
                },
              ],
              "capabilities": undefined,
              "chainId": "0x1",
              "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
              "id": undefined,
              "version": "2.0.0",
            },
          ],
        },
      ]
    `)
  })
})
