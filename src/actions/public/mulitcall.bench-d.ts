import { bench } from '@arktype/attest'

import {
  baycContractConfig,
  usdcContractConfig,
} from '../../../test/src/abis.js'
import { anvil } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { multicall } from './multicall.js'

bench('multicall return type', async () => {
  const client = createClient({ chain: anvil, transport: http() })
  const res = multicall(client, {
    allowFailure: false,
    contracts: [
      {
        ...usdcContractConfig,
        functionName: 'totalSupply',
      },
      {
        ...usdcContractConfig,
        functionName: 'balanceOf',
        args: ['0x...'],
      },
      {
        ...baycContractConfig,
        functionName: 'name',
      },
    ],
  })
  return {} as typeof res
}).types([192503, 'instantiations'])
