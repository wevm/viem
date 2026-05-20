import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'
import * as actions from 'viem/actions'

describe('getGasPrice', () => {
  test('behavior: returns the current gas price', async () => {
    const client = anvil.getClient(anvilMainnet)

    const gasPrice = await actions.getGasPrice(client)

    expect(typeof gasPrice).toMatchInlineSnapshot(`"bigint"`)
  })
})
