import { expect, test } from 'vitest'
import { zkSyncChainL2 } from '~viem/chains/index.js'
import { createClient } from '~viem/clients/createClient.js'
import { http } from '~viem/clients/transports/http.js'
import { mockClientPublicActionsL2 } from '../../../test/src/zksync.js'
import { getFeeParams } from './getFeeParameters.js'

const clientL2 = createClient({
  chain: zkSyncChainL2,
  transport: http(),
})

// mockClientPublicActionsL2(clientL2)

test('default', async () => {
  const feeParams = await getFeeParams(clientL2)

  console.info(feeParams)
})
