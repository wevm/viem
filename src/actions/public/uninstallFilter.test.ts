import { describe, expect, test } from 'vp/test'

import * as actions from 'viem/actions'
import { anvilMainnet } from '../../../test/anvil.js'
import * as anvil from '../../../test/anvil.js'

describe('uninstallFilter', () => {
  test('behavior: returns true for an installed filter', async () => {
    const client = anvil.getClient(anvilMainnet)

    const filterId = await actions.createBlockFilter(client)
    const uninstalled = await actions.uninstallFilter(client, { filterId })

    expect(uninstalled).toBe(true)
  })

  test('behavior: returns false for an unknown filter', async () => {
    const client = anvil.getClient(anvilMainnet)

    const uninstalled = await actions.uninstallFilter(client, {
      filterId: '0xdeadbeef',
    })

    expect(uninstalled).toBe(false)
  })
})
