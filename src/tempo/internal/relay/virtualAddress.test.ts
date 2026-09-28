import { Hex } from 'ox'
import { createClient } from 'viem'
import { type Relay, VirtualAddress, withRelay } from 'viem/tempo'
import { expect, test } from 'vitest'
import * as Tempo from '~test/tempo/config.js'
import { resolveVirtualAddresses } from './virtualAddress.js'

test('rejects excessive virtual-address targets', async () => {
  await expect(
    resolveVirtualAddresses(Tempo.getClient({ chain: Tempo.chain }), {
      calls: Array.from({ length: 101 }, (_, i) => ({
        to: VirtualAddress.from({
          masterId: Hex.fromNumber(i + 1000, { size: 4 }),
          userTag: '0x000000000001',
        }),
      })),
    }),
  ).rejects.toMatchObject({
    code: -32602,
    message: 'Virtual-address targets exceed the limit of 100 addresses.',
  })
})

test('resolves targets within a downstream concurrency budget', async () => {
  const active = new Set<symbol>()
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [
        (next) => async (request, options) => {
          const slot = Symbol()
          active.add(slot)
          try {
            if (active.size > 10)
              throw new Error('Downstream concurrency exceeded')
            return await next(request, options)
          } finally {
            active.delete(slot)
          }
        },
      ] satisfies readonly Relay.Plugin[],
    }),
  })
  const calls = Array.from({ length: 30 }, (_, i) => ({
    to: VirtualAddress.from({
      masterId: Hex.fromNumber(i + 1000, { size: 4 }),
      userTag: '0x000000000001',
    }),
  }))
  const result = await resolveVirtualAddresses(client, { calls })
  expect(Object.keys(result ?? {})).toHaveLength(30)
  expect(Object.values(result ?? {})).toEqual(Array(30).fill(null))
})
