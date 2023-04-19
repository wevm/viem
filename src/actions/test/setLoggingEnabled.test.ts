import { test } from 'vitest'

import { testClient, setupAnvil } from '../../_test/index.js'

import { setLoggingEnabled } from './setLoggingEnabled.js'

setupAnvil()

test('sets logging', async () => {
  await setLoggingEnabled(testClient, false)
  await setLoggingEnabled(testClient, true)
})
