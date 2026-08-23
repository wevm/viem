import { ZoneId } from 'ox/tempo'
import { tempoModerato } from '../../../src/chains/definitions/tempoModerato.js'
import {
  type Address,
  type ClientConfig,
  createClient,
  type Transport,
  type Account as viem_Account,
} from '../../../src/index.js'
import {
  type HttpConfig,
  http as zoneHttp,
} from '../../../src/tempo/Transport.js'
import * as Zone from '../../../src/tempo/Zone.js'
import { debugOptions, nodeEnv, chain as parentChain } from './config.js'
import * as Prool from './prool.js'

// On localnet, provision a fresh zone (`tempo-zone dev`) against this
// worker's L1 and derive the chain from its runtime metadata.
const local = nodeEnv === 'localnet' ? await Prool.zone1.start() : undefined
const configuredRpcUrl = import.meta.env.VITE_TEMPO_ZONE_RPC_URL
if (!local && !configuredRpcUrl)
  throw new Error(
    '`VITE_TEMPO_ZONE_RPC_URL` is required for remote Zone tests.',
  )

export const zoneId =
  local?.zoneId ?? ZoneId.fromChainId(Zone.internalTestnet.id, tempoModerato.id)

export const factoryAddress = local?.factoryAddress

export const zone = local
  ? Zone.from({
      id: local.chainId,
      name: `Tempo Zone ${local.zoneId} (Local)`,
      rpcUrls: {
        // The private RPC proxy is the user-facing endpoint (it serves the
        // auth-scoped `eth_*` whitelist plus the `zone_*` namespace), matching
        // the public `rpc-zone-*` endpoints.
        default: {
          http: [local.privateRpcUrl],
        },
      },
      sourceId: parentChain.id,
    })
  : Zone.from({
      id: Zone.internalTestnet.id,
      name: Zone.internalTestnet.name,
      rpcUrls: { default: { http: [configuredRpcUrl!] } },
      sourceId: Zone.internalTestnet.sourceId,
    })

export const rpcUrl = zone.rpcUrls.default.http[0]!

export const unredactedRpcUrl = local?.rpcUrl ?? rpcUrl

export const http = (url = rpcUrl, config: HttpConfig = {}) =>
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
      'account' | 'batch' | 'chain' | 'transport'
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
