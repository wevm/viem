import { bench } from '@arktype/attest'

import { usdcContractConfig } from '../../../test/src/abis.js'
import { anvil } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { readContract } from './readContract.js'

bench('readContract return type', async () => {
  const client = createClient({ chain: anvil, transport: http() })
  const res = readContract(client, {
    ...usdcContractConfig,
    functionName: 'balanceOf',
    args: ['0x...'],
  })
  return {} as typeof res
}).types([152288, 'instantiations'])
