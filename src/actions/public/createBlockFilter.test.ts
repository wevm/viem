import { expect, test } from 'vitest'

import { publicClient } from '../../_test'

import { createBlockFilter } from './createBlockFilter'

test('default', async () => {
  expect(await createBlockFilter(publicClient)).toBeDefined()
})
