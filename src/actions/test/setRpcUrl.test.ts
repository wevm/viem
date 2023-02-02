import { test } from 'vitest'

import { testClient } from '../../_test'

import { setRpcUrl } from './setRpcUrl'

test('sets the rpc url', async () => {
  await setRpcUrl(testClient, process.env.VITE_ANVIL_FORK_URL!)
})
