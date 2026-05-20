import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import { Client, http } from 'viem'
import * as actions from 'viem/actions'

describe('getChainId', () => {
  test('behavior: returns the current chain id as a bigint', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    await expect(actions.getChainId(client)).resolves.toMatchInlineSnapshot(
      `31337n`,
    )
  })
})
