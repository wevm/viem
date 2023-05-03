import { expect, test } from 'vitest'

import { forkUrl, testClient } from '../../_test/index.js'
import { setRpcUrl } from './setRpcUrl.js'

test('sets the rpc url', async () => {
  await expect(setRpcUrl(testClient, forkUrl)).resolves.toBeUndefined()
})
