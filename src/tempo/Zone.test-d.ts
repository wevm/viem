import { Addresses, Zone } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

test('exposes Zone definitions', () => {
  expectTypeOf(Zone.a.id).toEqualTypeOf<4217000006>()
  expectTypeOf(
    Zone.a.rpcUrls.default.http[0],
  ).toEqualTypeOf<'https://rpc-zone-a.testnet.tempo.xyz'>()
  expectTypeOf(Zone.a.sourceId).toEqualTypeOf<42431>()
  expectTypeOf(Zone.b.id).toEqualTypeOf<4217000007>()
  expectTypeOf(
    Zone.b.rpcUrls.default.http[0],
  ).toEqualTypeOf<'https://rpc-zone-b.testnet.tempo.xyz'>()
  expectTypeOf(Zone.b.sourceId).toEqualTypeOf<42431>()
  expectTypeOf(Zone.internal.id).toEqualTypeOf<421700001>()
  expectTypeOf(Zone.internal.rpcUrls.default.http).toEqualTypeOf<string[]>()
  expectTypeOf(Zone.internal.sourceId).toEqualTypeOf<4217>()
  expectTypeOf(Zone.internalTestnet.id).toEqualTypeOf<1424310003>()
  expectTypeOf(Zone.internalTestnet.rpcUrls.default.http).toEqualTypeOf<
    string[]
  >()
  expectTypeOf(Zone.internalTestnet.sourceId).toEqualTypeOf<42431>()
  expectTypeOf(Addresses.zonePortal(Zone.a.id)).toEqualTypeOf<`0x${string}`>()
  const zone = Zone.from({ id: 123, name: 'Custom Zone', sourceId: 1 })
  expectTypeOf(zone.id).toEqualTypeOf<123>()
  expectTypeOf(zone.name).toEqualTypeOf<'Custom Zone'>()
  expectTypeOf(zone.rpcUrls.default.http).toEqualTypeOf<string[]>()
  expectTypeOf(zone.sourceId).toEqualTypeOf<1>()

  const annotated: ReturnType<typeof Zone.from> = zone
  expectTypeOf(annotated.id).toEqualTypeOf<number>()
})

test('exposes Zone protocol addresses', () => {
  expectTypeOf<
    typeof Addresses.zoneFactory
  >().toEqualTypeOf<'0x5aF2000000000000000000000000000000000000'>()
  expectTypeOf<
    typeof Addresses.zoneMessenger
  >().toEqualTypeOf<'0x5A4d000000000000000000000000000000000000'>()
  expectTypeOf<
    typeof Addresses.zonePortalImplementation
  >().toEqualTypeOf<'0x5AD1000000000000000000000000000000000000'>()
  expectTypeOf<
    typeof Addresses.zoneVerifier
  >().toEqualTypeOf<'0x5a56000000000000000000000000000000000000'>()
})
