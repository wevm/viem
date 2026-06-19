import { describe, expect, test } from 'vitest'

import { anvilMainnet, getClient } from '~test/anvil.js'

import { publicActions } from './public.js'

describe('publicActions', () => {
  test('decorates a client with public actions', async () => {
    const client = getClient(anvilMainnet).extend(publicActions())
    expect(typeof (await client.getBlockNumber())).toBe('bigint')
    expect(await client.getChainId()).toBe(1)
    expect(await client.getGasPrice()).toBeTypeOf('bigint')
  })
})
