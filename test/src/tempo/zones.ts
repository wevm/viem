import {
  type Address,
  type ClientConfig,
  createClient,
  type Transport,
  type Account as viem_Account,
} from '../../../src/index.js'
import {
  type ZoneHttpConfig,
  http as zoneHttp,
} from '../../../src/tempo/zones/transport.js'
import { zoneModerato } from '../../../src/tempo/zones/zone.js'
import { debugOptions } from './config.js'

const credentials = import.meta.env.VITE_TEMPO_CREDENTIALS

export const chain = zoneModerato(7)

export const rpcUrl = 'https://rpc-zone-006-private.tempoxyz.dev'

export const http = (url = rpcUrl, config: ZoneHttpConfig = {}) =>
  zoneHttp(url, {
    ...debugOptions({ rpcUrl: url }),
    ...(credentials
      ? {
          fetchOptions: {
            headers: {
              Authorization: `Basic ${btoa(credentials)}`,
            },
          },
        }
      : {}),
    ...config,
  })

export function getClient<
  accountOrAddress extends viem_Account | Address | undefined = undefined,
>(
  parameters: Partial<
    Pick<
      ClientConfig<Transport, typeof chain, accountOrAddress>,
      'account' | 'chain' | 'transport'
    >
  > = {},
) {
  return createClient({
    pollingInterval: 100,
    chain,
    transport: http(),
    ...parameters,
  })
}
