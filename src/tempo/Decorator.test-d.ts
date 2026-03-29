import type { Address } from 'abitype'
import { expectTypeOf, test } from 'vitest'
import { privateKeyToAccount } from '../accounts/privateKeyToAccount.js'
import { tempoLocalnet, tempoModerato } from '../chains/index.js'
import { createClient } from '../clients/createClient.js'
import { createWalletClient } from '../clients/createWalletClient.js'
import { custom } from '../clients/transports/custom.js'
import { http } from '../clients/transports/http.js'
import type { Hex } from '../types/misc.js'
import type { GetZoneInfoRpcReturnType } from './actions/zone.js'
import { decorator as tempoActions } from './Decorator.js'
import * as Secp256k1 from './Secp256k1.js'

type GetZoneInfoRpc = {
  Method: 'zone_getZoneInfo'
  Parameters: []
  ReturnType: GetZoneInfoRpcReturnType
}

function createAccount() {
  return privateKeyToAccount(Secp256k1.randomPrivateKey())
}

const account = createAccount()

test('getZoneClient: available on wallet clients with configured zones', () => {
  const client = createWalletClient({
    account,
    chain: tempoModerato,
    transport: http(),
  }).extend(tempoActions())

  const zoneClient = client.getZoneClient({ zone: 26 })
  expectTypeOf(zoneClient.chain.id).toEqualTypeOf<4217000026>()
  expectTypeOf(zoneClient.chain.sourceId).toEqualTypeOf<42431>()
  expectTypeOf(zoneClient.readContract).toBeFunction()
  expectTypeOf(zoneClient.writeContract).toBeFunction()

  const zoneClientWithTransport = client.getZoneClient({
    zone: 26,
    transport: { timeout: 1_000 },
  })
  expectTypeOf(zoneClientWithTransport.chain.id).toEqualTypeOf<4217000026>()

  const zoneClientWithCustomTransport = client.getZoneClient({
    zone: 26,
    transport: custom({ request: async () => null }),
  })
  expectTypeOf(
    zoneClientWithCustomTransport.chain.id,
  ).toEqualTypeOf<4217000026>()
  expectTypeOf(
    zoneClientWithCustomTransport.transport.type,
  ).toEqualTypeOf<'custom'>()

  const zoneInfo = zoneClient.request<GetZoneInfoRpc>({
    method: 'zone_getZoneInfo',
    params: [],
  })
  expectTypeOf(zoneInfo).toEqualTypeOf<Promise<GetZoneInfoRpcReturnType>>()

  const chainId = zoneClient.request({ method: 'eth_chainId' })
  expectTypeOf(chainId).toEqualTypeOf<Promise<Hex>>()

  const tokenInfo = zoneClient.zone.getAuthorizationTokenInfo()
  expectTypeOf(tokenInfo).toEqualTypeOf<
    Promise<{
      account: Address
      expiresAt: bigint
    }>
  >()

  const preparedToken = zoneClient.zone.prepareAuthorizationToken()
  expectTypeOf(preparedToken).toEqualTypeOf<
    Promise<{
      account: Address
      expiresAt: bigint
    }>
  >()

  const zoneInfoAction = zoneClient.zone.getZoneInfo()
  expectTypeOf(zoneInfoAction).toEqualTypeOf<
    Promise<{
      chainId: number
      sequencer: Address
      zoneId: number
      zoneTokens: readonly Address[]
    }>
  >()

  const depositStatus = zoneClient.zone.getDepositStatus({
    tempoBlockNumber: 42n,
  })
  expectTypeOf(depositStatus).toEqualTypeOf<
    Promise<{
      deposits: readonly {
        amount: bigint
        depositHash: Hex
        kind: 'encrypted' | 'regular'
        memo: Hex | null
        recipient: Address | null
        sender: Address
        status: 'failed' | 'pending' | 'processed'
        token: Address
      }[]
      processed: boolean
      tempoBlockNumber: bigint
      zoneProcessedThrough: bigint
    }>
  >()

  const tokenBalance = zoneClient.token.getBalance({
    token: '0x20c0000000000000000000000000000000000000',
  })
  expectTypeOf(tokenBalance).toEqualTypeOf<Promise<bigint>>()

  const tokenTransfer = zoneClient.token.transfer({
    amount: 1n,
    to: '0x1111111111111111111111111111111111111111',
    token: '0x20c0000000000000000000000000000000000000',
  })
  expectTypeOf(tokenTransfer).toEqualTypeOf<Promise<Hex>>()

  // @ts-expect-error
  zoneClient.zone.getDepositStatus()

  // @ts-expect-error
  zoneClient.zone.getDepositStatus({ tempoBlockNumber: '0x2a' })

  // @ts-expect-error
  client.getZoneClient({ zone: 26, transport: { batch: true } })

  // @ts-expect-error
  zoneClient.request<GetZoneInfoRpc>({ method: 'zone_getZoneInfo' })

  // @ts-expect-error
  client.getZoneClient({ zone: 27 })
})

test('getZoneClient: unavailable without wallet actions', () => {
  const client = createClient({
    account,
    chain: tempoModerato,
    transport: http(),
  }).extend(tempoActions())

  // @ts-expect-error
  client.getZoneClient({ zone: 26 })
})

test('getZoneClient: unavailable without configured zones', () => {
  const client = createWalletClient({
    account,
    chain: tempoLocalnet,
    transport: http(),
  }).extend(tempoActions())

  // @ts-expect-error
  client.getZoneClient({ zone: 26 })
})

test('getZoneClient: unavailable without a signing account', () => {
  const client = createWalletClient({
    chain: tempoModerato,
    transport: http(),
  }).extend(tempoActions())

  // @ts-expect-error
  client.getZoneClient({ zone: 26 })
})
