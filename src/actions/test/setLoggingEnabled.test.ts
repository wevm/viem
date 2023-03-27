import { test } from 'vitest'

import { testClient } from '../../_test.js'

import { setLoggingEnabled } from './setLoggingEnabled.js'

test('sets logging', async () => {
  await setLoggingEnabled(testClient, false)
  await setLoggingEnabled(testClient, true)
})
