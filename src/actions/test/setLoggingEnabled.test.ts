import { expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { setLoggingEnabled } from './setLoggingEnabled.js'

const client = anvilMainnet.getClient()

test('sets logging', async () => {
  await expect(setLoggingEnabled(client, false)).resolves.toBeUndefined()
  await setLoggingEnabled(client, true)
})
