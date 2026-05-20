import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import * as Client from '../../core/Client.js'
import { http } from '../../core/transports/index.js'
import { getChainId } from './getChainId.js'

describe('getChainId', () => {
  test('behavior: returns the current chain id as a bigint', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    await expect(getChainId(client)).resolves.toMatchInlineSnapshot(`31337n`)
  })
})
