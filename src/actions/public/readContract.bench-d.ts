import { attest } from '@ark/attest'
import { test } from 'vitest'

import { usdcContractConfig } from '../../../test/src/abis.js'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { readContract } from './readContract.js'

const client = createClient({ chain: mainnet, transport: http() })

test('return type', () => {
  const res = readContract(client, {
    ...usdcContractConfig,
    functionName: 'balanceOf',
    args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
  })
  attest.instantiations([53192, 'instantiations'])
  attest<Promise<bigint>>(res)
})
