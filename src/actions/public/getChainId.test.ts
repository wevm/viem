import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'
import * as actions from 'viem/actions'

describe('getChainId', () => {
  test('behavior: returns the current chain id as a bigint', async () => {
    const client = anvil.getClient(anvilMainnet)

    await expect(actions.getChainId(client)).resolves.toMatchInlineSnapshot(
      `31337n`,
    )
  })
})
