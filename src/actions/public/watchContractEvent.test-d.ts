import type { Abi, Address } from 'abitype'
import { expectTypeOf, test } from 'vitest'

import { usdcContractConfig } from '~test/abis.js'
import { anvilMainnet } from '~test/anvil.js'

import type { Log } from '../../types/log.js'
import { watchContractEvent } from './watchContractEvent.js'

const client = anvilMainnet.getClient()

test('defined inline', () => {
  watchContractEvent(client, {
    abi: usdcContractConfig.abi,
    onLogs(logs) {
      expectTypeOf(logs[0].args).toEqualTypeOf<
        | {
            owner?: Address | undefined
            spender?: Address | undefined
            value?: bigint | undefined
          }
        | {
            from?: Address | undefined
            to?: Address | undefined
            value?: bigint | undefined
          }
      >()
    },
  })
})

test('declared as Abi', () => {
  watchContractEvent(client, {
    abi: usdcContractConfig.abi as Abi,
    eventName: 'Foo',
    onLogs(logs) {
      expectTypeOf(logs[0]).toEqualTypeOf<Log>()
    },
  })
})

test('no const assertion', () => {})
