import { expect, test } from 'vitest'

import { testClient } from '~test/src/utils.js'

import { setLoggingEnabled } from './setLoggingEnabled.js'

test('sets logging', async () => {
  await expect(setLoggingEnabled(testClient, false)).resolves.toBeUndefined()
  await setLoggingEnabled(testClient, true)
})
