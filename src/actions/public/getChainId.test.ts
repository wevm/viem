import { expect, test } from 'vitest'

import { publicClient, setupAnvil } from '../../_test/index.js'
import { getChainId } from './getChainId.js'

setupAnvil()

test('default', async () => {
  expect(await getChainId(publicClient)).toBe(1)
})
