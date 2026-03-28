import type { Address } from 'abitype'
import { SignatureEnvelope, ZoneRpcAuthenticationTempo } from 'ox/tempo'
import type { Account } from '../../accounts/types.js'
import { type Client, createClient } from '../../clients/createClient.js'
import {
  type PublicActions,
  publicActions,
} from '../../clients/decorators/public.js'
import {
  type WalletActions,
  walletActions,
} from '../../clients/decorators/wallet.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import {
  type HttpTransport,
  type HttpTransportConfig,
  http,
} from '../../clients/transports/http.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import type { Assign, Prettify } from '../../types/utils.js'
import { defineChain } from '../../utils/chain/defineChain.js'
import * as zoneActions from '../actions/zone.js'
import {
  ZoneNotConfiguredError,
  ZoneRpcUrlNotConfiguredError,
} from '../errors/zone.js'

const authorizationTokenTtl = 600
const authorizationTokenRefreshBuffer = 30

const p256Order =
  0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n // secretlint-disable-line
const p256HalfOrder =
  0x7fffffff800000007fffffffffffffffde737d56d38bcf4279dce5617e3192a8n // secretlint-disable-line

type HashSignAccount = {
  sign: (parameters: { hash: Hex }) => Promise<Hex>
}

type ZoneDecorator = { zone: zoneActions.ZoneActions }

export type ZoneTransportConfig = Omit<
  HttpTransportConfig,
  'batch' | 'raw' | 'rpcSchema'
>

export type GetZoneClientParameters = {
  transport?: ZoneTransportConfig | undefined
  zone: number
}

export type ZoneConfig = {
  blockExplorers?: Chain['blockExplorers'] | undefined
  chainId: number
  name?: string | undefined
  portalAddress: Address
  rpcUrls: Chain['rpcUrls']
}

export type ZoneId<chain extends Chain | undefined> = chain extends {
  zones: infer zones extends Record<number, ZoneConfig>
}
  ? keyof zones & number
  : never

type ZoneById<
  chain extends Chain | undefined,
  zone extends number,
> = chain extends {
  zones: infer zones extends Record<number, ZoneConfig>
}
  ? zone extends keyof zones
    ? zones[zone]
    : never
  : never

type ZoneName<chain extends Chain | undefined, zone extends number> = ZoneById<
  chain,
  zone
> extends {
  name: infer name extends string
}
  ? name
  : string

export type ZoneChain<
  chain extends Chain,
  zone extends ZoneId<chain>,
> = Prettify<
  Assign<
    chain,
    {
      blockExplorers: ZoneById<chain, zone>['blockExplorers']
      id: ZoneById<chain, zone>['chainId']
      name: ZoneName<chain, zone>
      rpcUrls: ZoneById<chain, zone>['rpcUrls']
      sourceId: chain['id']
      zones: undefined
    }
  >
>

export type ZoneClient<
  chain extends Chain,
  account extends Account | undefined,
> = Prettify<
  Client<
    HttpTransport,
    chain,
    account,
    undefined,
    PublicActions<HttpTransport, chain, account> &
      WalletActions<chain, account> &
      ZoneDecorator
  >
>

type HasHashSigner<client extends Client> = client extends Client<
  Transport,
  Chain | undefined,
  infer account
>
  ? account extends HashSignAccount
    ? true
    : false
  : false

type HasWalletActions<client extends Client> = client extends WalletActions<
  any,
  any
>
  ? true
  : false

type GetZoneClientReturnType<
  client extends Client,
  zone extends number,
> = client extends Client<
  Transport,
  infer chain extends Chain,
  infer account extends Account | undefined
>
  ? ZoneClient<ZoneChain<chain, zone & ZoneId<chain>>, account>
  : never

export type GetZoneClientDecorator<client extends Client> =
  HasWalletActions<client> extends true
    ? HasHashSigner<client> extends true
      ? ZoneId<client['chain']> extends never
        ? {}
        : {
            /**
             * Creates a wallet-capable client for a Tempo zone configured on the current chain.
             *
             * The returned client automatically signs and caches short-lived zone authorization
             * tokens, and exposes both public and wallet actions against the zone RPC.
             *
             * By default, the zone client reuses the current HTTP transport settings where possible,
             * but disables HTTP batching because zone authorization tokens are account-scoped.
             */
            getZoneClient: <
              const zone extends ZoneId<client['chain']>,
            >(parameters: {
              transport?: ZoneTransportConfig | undefined
              zone: zone
            }) => GetZoneClientReturnType<client, zone>
          }
      : {}
    : {}

type CachedAuthorizationToken = {
  expiresAt: number
  token: string
}

function normalizeSignatureEnvelope(
  envelope: SignatureEnvelope.SignatureEnvelope,
): SignatureEnvelope.SignatureEnvelope {
  if (envelope.type === 'keychain') {
    return {
      ...envelope,
      inner: normalizeSignatureEnvelope(envelope.inner),
    }
  }

  if (
    (envelope.type === 'p256' || envelope.type === 'webAuthn') &&
    envelope.signature.s > p256HalfOrder
  ) {
    return {
      ...envelope,
      signature: {
        ...envelope.signature,
        s: p256Order - envelope.signature.s,
      },
    }
  }

  return envelope
}

function normalizeSignature(signature: Hex): Hex {
  const envelope = SignatureEnvelope.deserialize(signature)
  const normalized = normalizeSignatureEnvelope(envelope)
  return SignatureEnvelope.serialize(normalized)
}

function createAuthorizationTokenGetter(
  account: HashSignAccount,
  zoneId: number,
  zone: ZoneConfig,
) {
  let cachedToken: CachedAuthorizationToken | undefined
  let inflight: Promise<string> | undefined

  return async () => {
    const now = Math.floor(Date.now() / 1000)
    if (
      cachedToken &&
      cachedToken.expiresAt - now > authorizationTokenRefreshBuffer
    ) {
      return cachedToken.token
    }

    if (inflight) return inflight

    inflight = (async () => {
      try {
        const issuedAt = Math.floor(Date.now() / 1000)
        const expiresAt = issuedAt + authorizationTokenTtl
        const authentication = ZoneRpcAuthenticationTempo.from({
          chainId: zone.chainId,
          expiresAt,
          issuedAt,
          zoneId,
          zonePortal: zone.portalAddress,
        })
        const signature = normalizeSignature(
          await account.sign({
            hash: ZoneRpcAuthenticationTempo.getSignPayload(authentication),
          }),
        )

        const token = ZoneRpcAuthenticationTempo.serialize(authentication, {
          signature,
        }).slice(2)
        cachedToken = { expiresAt, token }
        return token
      } finally {
        inflight = undefined
      }
    })()

    return inflight
  }
}

function getZoneTransportConfig(
  client: Client,
  transport: ZoneTransportConfig | undefined,
): ZoneTransportConfig {
  const base: ZoneTransportConfig = {
    retryCount: client.transport.retryCount,
    retryDelay: client.transport.retryDelay,
    timeout: client.transport.timeout,
  }

  if (client.transport.type === 'http') {
    const httpTransport = client.transport as typeof client.transport & {
      fetchOptions?: HttpTransportConfig['fetchOptions'] | undefined
    }
    base.fetchOptions = httpTransport.fetchOptions
    base.key = client.transport.key
    base.methods = client.transport.methods
    base.name = client.transport.name
  }

  return { ...base, ...transport }
}

function createZoneTransport(parameters: {
  client: Client
  getAuthorizationToken: () => Promise<string>
  transport?: ZoneTransportConfig | undefined
  url: string
}): HttpTransport {
  const { client, getAuthorizationToken, transport, url } = parameters
  const transportConfig = getZoneTransportConfig(client, transport)
  const onFetchRequest = transportConfig.onFetchRequest

  return http(url, {
    ...transportConfig,
    batch: false,
    async onFetchRequest(request, init) {
      const next = (await onFetchRequest?.(request, init)) ?? init
      const headers = new Headers(next.headers)
      headers.set(
        ZoneRpcAuthenticationTempo.headerName,
        await getAuthorizationToken(),
      )
      return {
        ...next,
        headers,
      }
    },
  })
}

export function getZoneClient<
  transport extends Transport,
  chain extends Chain & { zones: Record<number, ZoneConfig> },
  account extends Account & HashSignAccount,
  zone extends ZoneId<chain>,
>(
  client: Client<transport, chain, account> & WalletActions<chain, account>,
  parameters: GetZoneClientParameters & { zone: zone },
): GetZoneClientReturnType<Client<transport, chain, account>, zone> {
  const zoneId = parameters.zone
  const zone = client.chain.zones[zoneId] as ZoneById<chain, zone> | undefined
  if (!zone) throw new ZoneNotConfiguredError({ chain: client.chain, zoneId })

  const getAuthorizationToken = createAuthorizationTokenGetter(
    client.account,
    zoneId,
    zone,
  )

  const url = zone.rpcUrls.default.http[0]
  if (!url)
    throw new ZoneRpcUrlNotConfiguredError({ chain: client.chain, zoneId })

  const { extend: _extend, ...baseChain } = client.chain as chain & {
    extend?: unknown
  }
  const zoneChain = defineChain({
    ...baseChain,
    blockExplorers: zone.blockExplorers,
    id: zone.chainId,
    name: zone.name ?? `${client.chain.name} Zone ${zoneId}`,
    rpcUrls: zone.rpcUrls,
    sourceId: client.chain.id,
    zones: undefined,
  }) as unknown as ZoneChain<chain, zone>

  const zoneClient = createClient({
    account: client.account,
    batch: client.batch,
    cacheTime: client.cacheTime,
    ccipRead: client.ccipRead,
    chain: zoneChain,
    dataSuffix: client.dataSuffix,
    experimental_blockTag: client.experimental_blockTag,
    key: 'tempoZone',
    name: `Tempo Zone Client (${zoneId})`,
    pollingInterval: client.pollingInterval,
    transport: createZoneTransport({
      client,
      getAuthorizationToken,
      transport: parameters.transport,
      url,
    }),
    type: 'zoneClient',
  })
    .extend(publicActions)
    .extend(walletActions)
    .extend((client) => ({
      zone: {
        getAuthorizationTokenInfo: () =>
          zoneActions.getAuthorizationTokenInfo(client),
        getDepositStatus: (parameters) =>
          zoneActions.getDepositStatus(client, parameters),
        getZoneInfo: () => zoneActions.getZoneInfo(client),
      },
    }))

  return zoneClient as never
}
