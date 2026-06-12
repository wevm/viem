// TODO: configure to be compatible with localnet.
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

export const zone = zoneModerato(7)

export const rpcUrl = zone.rpcUrls.default.http[0]!

export const http = (url = rpcUrl, config: ZoneHttpConfig = {}) =>
  zoneHttp(url, {
    ...debugOptions({ rpcUrl: url }),
    ...config,
  })

export function getClient<
  accountOrAddress extends viem_Account | Address | undefined = undefined,
>(
  parameters: Partial<
    Pick<
      ClientConfig<Transport, typeof zone, accountOrAddress>,
      'account' | 'chain' | 'transport'
    >
  > = {},
) {
  return createClient({
    pollingInterval: 100,
    chain: zone,
    transport: http(),
    ...parameters,
  })
}
