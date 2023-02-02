import { test } from 'vitest'

import { testClient } from '../../_test'

import { setLoggingEnabled } from './setLoggingEnabled'

test('sets logging', async () => {
  await setLoggingEnabled(testClient, false)
  await setLoggingEnabled(testClient, true)
})
