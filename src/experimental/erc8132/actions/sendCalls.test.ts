import { describe, expect, test } from 'vitest'
import { mainnet } from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import { parseEther } from '../../../utils/index.js'
import { sendCalls } from './sendCalls.js'

const accounts = [
  { address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' },
  { address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8' },
  { address: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc' },
  { address: '0x90f79bf6eb2c4f870365e785982e1f101e93b906' },
] as const

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
    const requests: { method: string; params: unknown }[] = []

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

    expect(requests).toHaveLength(1)
    expect(requests[0].method).toBe('wallet_sendCalls')

    const params = (requests[0].params as any)[0]
    expect(params.calls[0].capabilities).toBeUndefined()
    expect(params.calls[1].capabilities).toBeUndefined()
  })

  test('calls with gas - gasLimitOverride capability added', async () => {
    const requests: { method: string; params: unknown }[] = []

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

    expect(requests).toHaveLength(1)
    expect(requests[0].method).toBe('wallet_sendCalls')

    const params = (requests[0].params as any)[0]
    expect(params.calls[0].capabilities).toEqual({
      gasLimitOverride: { value: '0x186a0' }, // 100000 in hex
    })
    expect(params.calls[1].capabilities).toEqual({
      gasLimitOverride: { value: '0x30d40' }, // 200000 in hex
    })
  })

  test('mixed calls - some with gas, some without', async () => {
    const requests: { method: string; params: unknown }[] = []

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
          // No gas - wallet should estimate
        },
        {
          to: accounts[3].address,
          value: parseEther('0.5'),
          gas: 50000n,
        },
      ],
    })

    expect(requests).toHaveLength(1)
    expect(requests[0].method).toBe('wallet_sendCalls')

    const params = (requests[0].params as any)[0]
    expect(params.calls[0].capabilities).toEqual({
      gasLimitOverride: { value: '0x186a0' }, // 100000 in hex
    })
    expect(params.calls[1].capabilities).toBeUndefined()
    expect(params.calls[2].capabilities).toEqual({
      gasLimitOverride: { value: '0xc350' }, // 50000 in hex
    })
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

    expect(result).toEqual({ id: 'test-id' })
  })

  test('batch-level capabilities are preserved', async () => {
    const requests: { method: string; params: unknown }[] = []

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

    expect(requests).toHaveLength(1)
    const params = (requests[0].params as any)[0]

    // Call-level capabilities
    expect(params.calls[0].capabilities).toEqual({
      gasLimitOverride: { value: '0x186a0' },
    })

    // Batch-level capabilities
    expect(params.capabilities).toEqual({
      paymasterService: {
        url: 'https://paymaster.example.com',
      },
    })
  })

  test('with abi encoding', async () => {
    const requests: { method: string; params: unknown }[] = []

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

    expect(requests).toHaveLength(1)
    const params = (requests[0].params as any)[0]

    // Data should be encoded
    expect(params.calls[0].data).toBeDefined()
    expect(params.calls[0].data.startsWith('0xa9059cbb')).toBe(true) // transfer selector

    // Gas capability should be present
    expect(params.calls[0].capabilities).toEqual({
      gasLimitOverride: { value: '0x186a0' },
    })
  })
})
