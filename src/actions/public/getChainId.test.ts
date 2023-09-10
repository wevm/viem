import { expect, test } from 'vitest'

import { publicClient } from '~test/src/utils.js'

import { getChainId } from './getChainId.js'

test('default', async () => {
  expect(await getChainId(publicClient)).toBe(1)
})
