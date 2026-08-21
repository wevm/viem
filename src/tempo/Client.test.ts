import * as Http from 'node:http'
import { http } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { createClient } from 'viem/tempo'
import { tokens } from 'viem/tokens'
import { describe, expect, test } from 'vitest'
import { createTransport } from '../clients/transports/createTransport.js'

import { tempo, tempoTestnet } from './Chain.js'

describe('createClient', () => {
  test('default', () => {
    const client = createClient()

    // Defaults to tempo mainnet + http transport.
    expect(client.chain).toEqual(tempo)
    expect(client.transport.type).toBe('http')

    // Decorated with publicActions, walletActions, and tempoActions.
    expect(typeof client.getBalance).toBe('function') // public
    expect(typeof client.sendTransaction).toBe('function') // wallet
    expect(typeof client.token).toBe('object') // tempo
    expect(typeof client.amm).toBe('object') // tempo
  })

  test('behavior: defaults tokens to the tempo set', () => {
    const client = createClient()
    expect(client.tokens).toBe(tokens.tempo)
  })

  test('behavior: tokens override', () => {
    const client = createClient({ tokens: [] })
    expect(client.tokens).toEqual([])
  })

  test('behavior: testnet', () => {
    const client = createClient({ testnet: true })
    expect(client.chain).toEqual(tempoTestnet)
  })

  test('behavior: chain override', () => {
    const client = createClient({ chain: tempoLocalnet })
    expect(client.chain).toEqual(tempoLocalnet)
  })

  test('behavior: chain overrides testnet', () => {
    const client = createClient({ chain: tempoLocalnet, testnet: true })
    expect(client.chain).toEqual(tempoLocalnet)
  })

  test('behavior: transport override', () => {
    const client = createClient({
      transport: http('https://example.com'),
    })
    expect(client.transport.url).toBe('https://example.com')
  })

  test('behavior: feeToken extended on chain', () => {
    const client = createClient({
      feeToken: '0x20c0000000000000000000000000000000000001',
    })
    expect(client.chain.id).toBe(tempo.id)
    expect((client.chain as { feeToken?: string }).feeToken).toBe(
      '0x20c0000000000000000000000000000000000001',
    )
  })

  test('behavior: feeToken extended on testnet chain', () => {
    const client = createClient({
      feeToken: '0x20c0000000000000000000000000000000000001',
      testnet: true,
    })
    expect(client.chain.id).toBe(tempoTestnet.id)
    expect((client.chain as { feeToken?: string }).feeToken).toBe(
      '0x20c0000000000000000000000000000000000001',
    )
  })

  test('behavior: multisig coordination preserves the transport', () => {
    const client = createClient({
      experimental_multisig: true,
      transport: http('http://localhost'),
    })

    expect(client.transport.type).toBe('http')
  })

  test('behavior: multisig coordination forwards request options', async () => {
    let requests = 0
    const client = createClient({
      experimental_multisig: true,
      transport: () =>
        createTransport({
          key: 'recording',
          name: 'Recording',
          request: async () => {
            requests++
            return 'tempo' as never
          },
          type: 'recording',
        }),
    })

    const controller = new AbortController()
    controller.abort()

    await expect(
      client.request(
        { method: 'web3_clientVersion' },
        { retryCount: 0, signal: controller.signal },
      ),
    ).rejects.toThrow()
    expect(requests).toBe(0)
  })

  test('behavior: multisig coordination preserves raw HTTP responses', async () => {
    const server = Http.createServer((request, response) => {
      let body = ''
      request.on('data', (chunk) => {
        body += chunk
      })
      request.on('end', () => {
        const rpc = JSON.parse(body) as { id: number }
        response.setHeader('content-type', 'application/json')
        response.end(
          JSON.stringify({ id: rpc.id, jsonrpc: '2.0', result: 'tempo' }),
        )
      })
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('unreachable')

    try {
      const client = createClient({
        experimental_multisig: true,
        transport: http(`http://127.0.0.1:${address.port}`, { raw: true }),
      })

      await expect(
        client.request({ method: 'web3_clientVersion' }),
      ).resolves.toStrictEqual({ result: 'tempo' })
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      )
    }
  })
})
