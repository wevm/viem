import { expect, test } from 'vitest'

import { testClient } from '~test/src/utils.js'
import { setRpcUrl } from './setRpcUrl.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

test('sets the rpc url', async () => {
  await expect(
    setRpcUrl(testClient, anvilMainnet.forkUrl),
  ).resolves.toBeUndefined()
})
