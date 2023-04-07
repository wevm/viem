import { test } from 'vitest'

import { testClient } from '../../_test/index.js'

import { setRpcUrl } from './setRpcUrl.js'

test('sets the rpc url', async () => {
  await setRpcUrl(testClient, process.env.VITE_ANVIL_FORK_URL!)
})
