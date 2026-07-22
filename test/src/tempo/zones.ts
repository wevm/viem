import { tempoModerato } from '../../../src/chains/definitions/tempoModerato.js'
import {
  type Address,
  type ClientConfig,
  createClient,
  createTransport,
  defineChain,
  type Transport,
  type Account as viem_Account,
} from '../../../src/index.js'
import { chainConfig } from '../../../src/tempo/chainConfig.js'
import {
  type ZoneHttpConfig,
  http as zoneHttp,
} from '../../../src/tempo/zones/transport.js'
import {
  getPortalAddress,
  zoneModerato,
} from '../../../src/tempo/zones/zone.js'
import { debugOptions, nodeEnv, chain as parentChain } from './config.js'
import * as Prool from './prool.js'

// On localnet, provision a fresh zone (`tempo-zone dev`) against this
// worker's L1 and derive the chain from its runtime metadata.
const local = nodeEnv === 'localnet' ? await Prool.zone1.start() : undefined

export const zoneId = local?.zoneId ?? 7

export const factoryAddress = local?.factoryAddress

export const portalAddress =
  local?.portalAddress ?? getPortalAddress(tempoModerato.id, zoneId)

export const zone = local
  ? defineChain({
      ...chainConfig,
      id: local.chainId,
      name: `Tempo Zone ${local.zoneId} (Local)`,
      nativeCurrency: {
        name: 'USD',
        symbol: 'USD',
        decimals: 6,
      },
      rpcUrls: {
        // The private RPC proxy is the user-facing endpoint (it serves the
        // auth-scoped `eth_*` whitelist plus the `zone_*` namespace), matching
        // the public `rpc-zone-*` endpoints.
        default: {
          http: [local.privateRpcUrl],
        },
      },
      sourceId: parentChain.id,
      supportsTransactionReplacementDetection: false,
    })
  : zoneModerato(zoneId)

export const rpcUrl = zone.rpcUrls.default.http[0]!

export const http = (url = rpcUrl, config: ZoneHttpConfig = {}) => {
  const transport = zoneHttp(url, {
    ...debugOptions({ rpcUrl: url }),
    ...config,
  })
  if (nodeEnv !== 'localnet') return transport

  // TODO: Remove this compatibility transport once `tempo-zone dev` supports Tempo's native TIP-1091 ZoneFactory and the pinned Zone image exposes `tempoBlockNumber`.
  return ((parameters) => {
    const { config: transportConfig, value } = transport(parameters)
    return createTransport(
      {
        ...transportConfig,
        async request(args) {
          const info = await transportConfig.request(args)
          if (
            args.method !== 'zone_getZoneInfo' ||
            typeof info !== 'object' ||
            info === null ||
            'tempoBlockNumber' in info
          )
            return info as never

          const status = (await transportConfig.request({
            method: 'zone_getDepositStatus',
            params: ['0x0'],
          })) as { zoneProcessedThrough: string }
          return {
            ...info,
            tempoBlockNumber: status.zoneProcessedThrough,
          } as never
        },
      },
      value,
    )
  }) satisfies Transport
}

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
