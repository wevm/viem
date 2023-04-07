import { expect, test } from 'vitest'

import { publicClient } from '../../_test/index.js'

import { createBlockFilter } from './createBlockFilter.js'

test('default', async () => {
  expect(await createBlockFilter(publicClient)).toBeDefined()
})
