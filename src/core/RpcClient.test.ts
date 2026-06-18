import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { http } from './RpcClient.js'

const client = http(anvilMainnet.rpcUrl.http)

describe('http', () => {
  test('sends a single request', async () => {
    const response = await client.request({ body: { method: 'eth_chainId' } })
    expect(response.result).toBe('0x1')
  })

  test('sends a batch request', async () => {
    const responses = await client.request({
      body: [{ method: 'eth_chainId' }, { method: 'eth_blockNumber' }],
    })
    expect(responses).toHaveLength(2)
    expect(responses.every((response) => 'result' in response)).toBe(true)
  })

  test('returns a JSON-RPC error in the response body', async () => {
    const response = await client.request({
      body: { method: 'eth_thisDoesNotExist' },
    })
    expect(typeof response.error?.code).toBe('number')
  })
})
