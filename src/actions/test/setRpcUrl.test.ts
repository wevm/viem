import { expect, test } from 'vitest'

import { forkUrl } from '~test/src/constants.js'
import { testClient } from '~test/src/utils.js'

import { setRpcUrl } from './setRpcUrl.js'

test('sets the rpc url', async () => {
  await expect(setRpcUrl(testClient, forkUrl)).resolves.toBeUndefined()
})
