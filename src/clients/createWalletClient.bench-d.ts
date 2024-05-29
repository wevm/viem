import { bench } from '@arktype/attest'

import { createClient } from './createClient.js'
import { createWalletClient } from './createWalletClient.js'
import { walletActions } from './decorators/wallet.js'
import { http } from './transports/http.js'

bench('createWalletClient', () => {
  const client = createWalletClient({ transport: http() })
  return {} as typeof client
}).types([1384, 'instantiations'])

bench('createClient.extend + walletActions', () => {
  const client = createClient({ transport: http() }).extend(walletActions)
  return {} as typeof client
}).types([193153, 'instantiations'])
