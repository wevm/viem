import { expect, test } from 'vitest'

import { testClient } from '~test/src/utils.js'

import { dumpState } from './dumpState.js'

test('dumps state', async () => {
  expect(await dumpState(testClient)).toBeDefined()
})
