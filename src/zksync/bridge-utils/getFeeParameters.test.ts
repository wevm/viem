import { expect, test } from 'vitest'
import { zkSyncChainL2 } from '../../chains/definitions/zkSyncChain:L2.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { getFeeParams } from './getFeeParameters.js'

const clientL2 = createClient({
  chain: zkSyncChainL2,
  transport: http(),
})

// mockClientPublicActionsL2(clientL2)

test('default', async () => {
  const feeParams = await getFeeParams(clientL2)
  expect(feeParams).toBeDefined()
})
