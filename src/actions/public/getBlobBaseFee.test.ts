import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import { Client, http } from 'viem'
import * as actions from 'viem/actions'

describe('getBlobBaseFee', () => {
  test('behavior: returns the current blob base fee', async () => {
    const client = Client.create({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    const fee = await actions.getBlobBaseFee(client)

    expect(typeof fee).toMatchInlineSnapshot(`"bigint"`)
  })
})
