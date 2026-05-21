import { describe, expect, test } from 'vp/test'

import * as actions from 'viem/actions'
import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'

describe('createBlockFilter', () => {
  test('behavior: returns a hex filter identifier', async () => {
    const client = anvil.getClient(anvilMainnet)

    const filterId = await actions.createBlockFilter(client)

    expect(filterId).toMatch(/^0x[0-9a-f]+$/)
  })
})
