import { expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'

import { getChainId } from './getChainId.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  expect(await getChainId(client)).toBe(1)
})
