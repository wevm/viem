import { describe, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'

import { getChainId } from './getChainId.js'

describe('getChainId', () => {
  test('default', async () => {
    expect(await getChainId(anvil.getClient(anvil.mainnet))).toBe(1)
  })
})
