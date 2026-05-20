import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import { Client, http } from 'viem'
import * as actions from 'viem/actions'

describe('getGasPrice', () => {
  test('behavior: returns the current gas price', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    const gasPrice = await actions.getGasPrice(client)

    expect(typeof gasPrice).toMatchInlineSnapshot(`"bigint"`)
  })
})
