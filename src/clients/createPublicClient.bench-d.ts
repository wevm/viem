import { bench } from '@arktype/attest'

import { createClient } from './createClient.js'
import { createPublicClient } from './createPublicClient.js'
import { publicActions } from './decorators/public.js'
import { http } from './transports/http.js'

bench('createPublicClient', () => {
  const client = createPublicClient({ transport: http() })
  return {} as typeof client
}).types([13470, 'instantiations'])

bench('createClient.extend + publicActions', () => {
  const client = createClient({ transport: http() }).extend(publicActions)
  return {} as typeof client
}).types([246356, 'instantiations'])
