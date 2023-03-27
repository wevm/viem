import { expect, test } from 'vitest'

import { publicClient } from '../../_test.js'

import { createBlockFilter } from './createBlockFilter.js'

test('default', async () => {
  expect(await createBlockFilter(publicClient)).toBeDefined()
})
