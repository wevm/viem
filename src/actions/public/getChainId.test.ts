import { expect, test } from 'vitest'

import { publicClient } from '../../_test.js'
import { getChainId } from './getChainId.js'

test('default', async () => {
  expect(await getChainId(publicClient)).toBe(1)
})
