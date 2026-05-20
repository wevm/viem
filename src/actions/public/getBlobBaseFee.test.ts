import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'
import * as actions from 'viem/actions'

describe('getBlobBaseFee', () => {
  test('behavior: returns the current blob base fee', async () => {
    const client = anvil.getClient(anvilMainnet)

    const fee = await actions.getBlobBaseFee(client)

    expect(typeof fee).toMatchInlineSnapshot(`"bigint"`)
  })
})
