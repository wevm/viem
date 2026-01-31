import { describe, expect, test } from 'vitest'
import { mainnet } from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import { parseEther } from '../../../utils/index.js'
import { erc8132Actions } from './erc8132.js'

const accounts = [
  { address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' },
  { address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8' },
] as const

describe('erc8132Actions', () => {
  test('extends client with sendCalls', async () => {
    const requests: { method: string; params: unknown }[] = []

    const client = createClient({
      chain: mainnet,
      transport: custom({
        async request({ method, params }) {
          requests.push({ method, params })
          if (method === 'wallet_sendCalls') {
            return { id: 'test-id' }
          }
          return null
        },
      }),
    }).extend(erc8132Actions())

    const result = await client.sendCalls({
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
    expect(requests).toHaveLength(1)
    expect(requests[0].method).toBe('wallet_sendCalls')

    const params = (requests[0].params as any)[0]
    expect(params.calls[0].capabilities).toEqual({
      gasLimitOverride: { value: '0x186a0' },
    })
  })
})
