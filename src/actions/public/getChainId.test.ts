import { publicClient } from '../../_test/utils.js'
import { getChainId } from './getChainId.js'
import { expect, test } from 'vitest'

test('default', async () => {
  expect(await getChainId(publicClient)).toBe(1)
})
