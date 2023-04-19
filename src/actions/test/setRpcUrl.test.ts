import { test } from 'vitest'

import { testClient, setupAnvil } from '../../_test/index.js'

import { setRpcUrl } from './setRpcUrl.js'

setupAnvil()

test('sets the rpc url', async () => {
  await setRpcUrl(testClient, process.env.VITE_ANVIL_FORK_URL!)
})
