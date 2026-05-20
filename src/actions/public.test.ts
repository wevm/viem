import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../test/anvil.js'
import * as Client from '../core/Client.js'
import { http } from '../core/transports/index.js'
import { public_ } from './public.js'

describe('public', () => {
  test('behavior: exposes action functions', () => {
    expect(Object.keys(public_).sort()).toMatchInlineSnapshot(`
      [
        "getBlockNumber",
        "getChainId",
      ]
    `)
  })

  test('behavior: decorates clients with public actions', async () => {
    const client = Client.create({
      chain: anvilMainnet.chain,
      transport: http(anvilMainnet.rpcUrl.http),
    }).extend(public_())

    await expect(client.public.getChainId()).resolves.toMatchInlineSnapshot(
      `31337n`,
    )
    const blockNumber = await client.public.getBlockNumber()
    expect(typeof blockNumber).toMatchInlineSnapshot(`"bigint"`)
  })
})
