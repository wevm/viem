import { expect, test } from 'vitest'

import { publicClient } from '../../_test'
import { getChainId } from './getChainId'

test('default', async () => {
  expect(await getChainId(publicClient)).toBe(1)
})
