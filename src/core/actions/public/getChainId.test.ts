import { describe, expect, test } from 'vitest'

import { anvilMainnet, getClient } from '~test/anvil.js'

import { getChainId } from './getChainId.js'

describe('getChainId', () => {
  test('default', async () => {
    expect(await getChainId(getClient(anvilMainnet))).toBe(1)
  })
})
