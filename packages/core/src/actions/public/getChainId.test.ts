import { expect, test } from 'vitest'

import { publicClient } from '../../../test'
import { getChainId } from './getChainId'

test('default', async () => {
  expect(await getChainId(publicClient)).toBe(1)
})
