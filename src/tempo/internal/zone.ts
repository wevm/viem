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
import * as tokenActions from '../actions/token.js'
import * as zoneActions from '../actions/zone.js'
import {
  ZoneNotConfiguredError,
  ZoneRpcUrlNotConfiguredError,
} from '../errors/zone.js'

const authorizationTokenTtl = 1800
const authorizationTokenRefreshBuffer = 30
const authorizationTokenCache = /*#__PURE__*/ new Map<
  string,
  CachedAuthorizationTokenState
>()

const p256Order =
  0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n // secretlint-disable-line
const p256HalfOrder =
  0x7fffffff800000007fffffffffffffffde737d56d38bcf4279dce5617e3192a8n // secretlint-disable-line

type HashSignAccount = {
  sign: (parameters: { hash: Hex }) => Promise<Hex>
}

type AuthorizationTokenAccount = HashSignAccount & {
  address: Address
}

type ZoneDecorator = { zone: zoneActions.ZoneActions }
type ZoneTokenDecorator<
  chain extends Chain | undefined,
  account extends Account | undefined,
> = {
  token: {
    approve: (
      parameters: tokenActions.approve.Parameters<chain, account>,
    ) => Promise<tokenActions.approve.ReturnValue>
    approveSync: (
      parameters: tokenActions.approveSync.Parameters<chain, account>,
    ) => Promise<tokenActions.approveSync.ReturnValue>
    getAllowance: (
      parameters: tokenActions.getAllowance.Parameters<account>,
    ) => Promise<tokenActions.getAllowance.ReturnValue>
    getBalance: (
      parameters: tokenActions.getBalance.Parameters<account>,
    ) => Promise<tokenActions.getBalance.ReturnValue>
    getMetadata: (
      parameters: tokenActions.getMetadata.Parameters,
    ) => Promise<tokenActions.getMetadata.ReturnValue>
    transfer: (
      parameters: tokenActions.transfer.Parameters<chain, account>,
    ) => Promise<tokenActions.transfer.ReturnValue>
    transferSync: (
      parameters: tokenActions.transferSync.Parameters<chain, account>,
    ) => Promise<tokenActions.transferSync.ReturnValue>
  }
}

type ZoneExtension<
  chain extends Chain | undefined,
  account extends Account | undefined,
> = ZoneDecorator & ZoneTokenDecorator<chain, account>

type ZoneTransportOverride = Transport | ZoneTransportConfig

export type ZoneTransportConfig = Omit<
  HttpTransportConfig,
  'batch' | 'raw' | 'rpcSchema'
>

export type GetZoneClientParameters<
  zone extends number = number,
  zoneTransport extends ZoneTransportOverride | undefined = undefined,
> = {
  transport?: zoneTransport
  zone: zone
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
      blockExplorers?: Chain['blockExplorers'] | undefined
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
  transport extends Transport = HttpTransport,
> = Prettify<
  Client<
    transport,
    chain,
    account,
    undefined,
    PublicActions<transport, chain, account> &
      WalletActions<chain, account> &
      ZoneTokenDecorator<chain, account> &
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

type ResolveZoneTransport<
  zoneTransport extends ZoneTransportOverride | undefined,
> = zoneTransport extends Transport ? zoneTransport : HttpTransport

type GetZoneClientReturnType<
  client extends Client,
  zone extends number,
  zoneTransport extends ZoneTransportOverride | undefined = undefined,
> = client extends Client<
  Transport,
  infer chain extends Chain,
  infer account extends Account | undefined
>
  ? ZoneClient<
      ZoneChain<chain, zone & ZoneId<chain>>,
      account,
      ResolveZoneTransport<zoneTransport>
    >
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
             * The returned client exposes both public and wallet actions against the zone RPC.
             *
             * When using the built-in HTTP transport, it automatically signs and caches
             * short-lived zone authorization tokens.
             *
             * By default, the zone client reuses the current HTTP transport settings where possible,
             * but disables HTTP batching because zone authorization tokens are account-scoped.
             * Passing a transport factory via `transport` fully overrides this behavior.
             */
            getZoneClient: <
              const zone extends ZoneId<client['chain']>,
              zoneTransport extends
                | ZoneTransportOverride
                | undefined = undefined,
            >(
              parameters: GetZoneClientParameters<zone, zoneTransport>,
            ) => GetZoneClientReturnType<client, zone, zoneTransport>
          }
      : {}
    : {}

type CachedAuthorizationToken = {
  expiresAt: number
  token: string
}

type CachedAuthorizationTokenState = {
  cachedToken?: CachedAuthorizationToken | undefined
  inflight?: Promise<CachedAuthorizationToken> | undefined
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

function getAuthorizationTokenCacheKey(
  account: AuthorizationTokenAccount,
  zoneId: number,
  zone: ZoneConfig,
) {
  return [
    account.address.toLowerCase(),
    zone.chainId,
    zoneId,
    zone.portalAddress.toLowerCase(),
  ].join(':')
}

function getAuthorizationTokenCacheState(cacheKey: string) {
  const cached = authorizationTokenCache.get(cacheKey)
  if (cached) return cached

  const state: CachedAuthorizationTokenState = {}
  authorizationTokenCache.set(cacheKey, state)
  return state
}

function createAuthorizationTokenGetter(
  account: AuthorizationTokenAccount,
  zoneId: number,
  zone: ZoneConfig,
) {
  const state = getAuthorizationTokenCacheState(
    getAuthorizationTokenCacheKey(account, zoneId, zone),
  )

  return async () => {
    const now = Math.floor(Date.now() / 1000)
    const cachedToken = state.cachedToken
    if (
      cachedToken &&
      cachedToken.expiresAt - now > authorizationTokenRefreshBuffer
    ) {
      return cachedToken
    }

    if (state.inflight) return state.inflight

    state.inflight = (async () => {
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
        const cachedToken = { expiresAt, token }
        state.cachedToken = cachedToken
        return cachedToken
      } finally {
        state.inflight = undefined
      }
    })()

    return state.inflight
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
  getAuthorizationToken: () => Promise<CachedAuthorizationToken>
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
        (await getAuthorizationToken()).token,
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
  zoneTransport extends ZoneTransportOverride | undefined = undefined,
>(
  client: Client<transport, chain, account> & WalletActions<chain, account>,
  parameters: GetZoneClientParameters<zone, zoneTransport>,
): GetZoneClientReturnType<
  Client<transport, chain, account>,
  zone,
  zoneTransport
> {
  const zoneId = parameters.zone
  const zone = client.chain.zones[zoneId] as ZoneById<chain, zone> | undefined
  if (!zone) throw new ZoneNotConfiguredError({ chain: client.chain, zoneId })

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

  const getAuthorizationToken = createAuthorizationTokenGetter(
    client.account,
    zoneId,
    zone,
  )

  const resolvedTransport: ResolveZoneTransport<zoneTransport> =
    typeof parameters.transport === 'function'
      ? (parameters.transport as ResolveZoneTransport<zoneTransport>)
      : ((() => {
          const url = zone.rpcUrls.default.http[0]
          if (!url)
            throw new ZoneRpcUrlNotConfiguredError({
              chain: client.chain,
              zoneId,
            })

          return createZoneTransport({
            client,
            getAuthorizationToken,
            transport: parameters.transport,
            url,
          })
        })() as ResolveZoneTransport<zoneTransport>)

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
    transport: resolvedTransport,
    type: 'zoneClient',
  })
    .extend(publicActions)
    .extend(walletActions)
    .extend(
      (client) =>
        ({
          token: {
            approve: (
              parameters: tokenActions.approve.Parameters<
                ZoneChain<chain, zone>,
                account
              >,
            ) => tokenActions.approve(client as never, parameters as never),
            approveSync: (
              parameters: tokenActions.approveSync.Parameters<
                ZoneChain<chain, zone>,
                account
              >,
            ) => tokenActions.approveSync(client as never, parameters as never),
            getAllowance: (
              parameters: tokenActions.getAllowance.Parameters<account>,
            ) =>
              tokenActions.getAllowance(client as never, parameters as never),
            getBalance: (
              parameters: tokenActions.getBalance.Parameters<account>,
            ) => tokenActions.getBalance(client as never, parameters as never),
            getMetadata: (parameters) =>
              tokenActions.getMetadata(client as never, parameters),
            transfer: (
              parameters: tokenActions.transfer.Parameters<
                ZoneChain<chain, zone>,
                account
              >,
            ) => tokenActions.transfer(client as never, parameters as never),
            transferSync: (
              parameters: tokenActions.transferSync.Parameters<
                ZoneChain<chain, zone>,
                account
              >,
            ) =>
              tokenActions.transferSync(client as never, parameters as never),
          },
          zone: {
            prepareAuthorizationToken: async () => {
              const { expiresAt } = await getAuthorizationToken()

              return {
                account: client.account.address,
                expiresAt: BigInt(expiresAt),
              }
            },
            getAuthorizationTokenInfo: () =>
              zoneActions.getAuthorizationTokenInfo(client),
            getDepositStatus: (
              parameters: zoneActions.getDepositStatus.Parameters,
            ) => zoneActions.getDepositStatus(client, parameters),
            getZoneInfo: () => zoneActions.getZoneInfo(client),
          },
        }) satisfies ZoneExtension<ZoneChain<chain, zone>, account>,
    )

  return zoneClient as never
}
