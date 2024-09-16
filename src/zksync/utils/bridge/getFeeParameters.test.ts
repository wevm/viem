import { expect, test } from 'vitest'
import { zkLocalChainL2 } from '../../../chains/definitions/zkLocalChainL2.js'
import { createClient } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import { getFeeParams } from './getFeeParameters.js'

const clientL2 = createClient({
  chain: zkLocalChainL2,
  transport: http(),
})

// mockClientPublicActionsL2(clientL2)

test('default', async () => {
  const feeParams = await getFeeParams(clientL2)
  expect(feeParams).toBeDefined()
})
