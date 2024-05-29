import { bench } from '@arktype/attest'

import { createClient } from './createClient.js'
import { createTestClient } from './createTestClient.js'
import { testActions } from './decorators/test.js'
import { http } from './transports/http.js'

bench('createTestClient', () => {
  const client = createTestClient({ mode: 'anvil', transport: http() })
  return {} as typeof client
}).types([668, 'instantiations'])

bench('createClient.extend + testActions', () => {
  const client = createClient({ transport: http() }).extend(
    testActions({ mode: 'anvil' }),
  )
  return {} as typeof client
}).types([6275, 'instantiations'])
